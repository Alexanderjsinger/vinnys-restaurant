import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const contentUrl = pathToFileURL(path.join(root, "src/lib/content.ts")).href;
const command = process.argv[2];
process.chdir(process.env.FIXTURE_DIR);

const content = await import(contentUrl);

if (command === "local-write") {
  const menu = await content.listMenu("public");
  const burger = menu.flatMap((section) => section.items).find((item) => item.name === "VINNY'S BURGER");
  await content.updateItem({
    id: burger.id,
    sectionId: burger.section_id,
    name: burger.name,
    description: burger.description,
    price: "99",
    isSample: false,
    status: "published",
  });
  await content.saveSetting("restaurant_name", "Fixture Grill", true);
  const inquiryId = await content.addInquiry({
    name: "Fixture Guest",
    email: "fixture-guest@example.com",
    eventDate: "2026-12-01",
    partySize: 8,
    message: "fixture only",
  });
  await content.addItem({
    sectionId: burger.section_id,
    name: "DRAFT PLATE",
    description: "not public",
    price: "7",
    isSample: false,
    status: "draft",
  });
  const published = await content.listMenu("public");
  const preview = await content.listMenu("preview");
  const saved = await content.listInquiries();
  console.log(
    JSON.stringify({
      price: published.flatMap((section) => section.items).find((item) => item.id === burger.id).price,
      draftVisible: published.flatMap((section) => section.items).some((item) => item.name === "DRAFT PLATE"),
      draftPreview: preview.flatMap((section) => section.items).some((item) => item.name === "DRAFT PLATE"),
      name: (await content.getSettings()).restaurant_name.value,
      emails: saved.map((row) => row.email),
      inquiryId,
    }),
  );
} else if (command === "snapshot-read") {
  const published = await content.listMenu("public");
  const require = createRequire(path.join(root, "src/lib/db.ts"));
  const Sqlite = require("better-sqlite3");
  const file = new Sqlite(path.join(process.cwd(), "data", "site.sqlite"), { readonly: true, fileMustExist: true });
  const sqlitePrice = file.prepare("SELECT price FROM menu_items WHERE name = ?").get("VINNY'S BURGER").price;
  const sqliteName = file.prepare("SELECT value FROM settings WHERE key = 'restaurant_name'").get().value;
  file.close();
  console.log(
    JSON.stringify({
      publicPrice: published.flatMap((section) => section.items).find((item) => item.name === "VINNY'S BURGER").price,
      publicName: (await content.getSettings()).restaurant_name.value,
      sqlitePrice,
      sqliteName,
    }),
  );
} else if (command === "local-read") {
  const published = await content.listMenu("public");
  console.log(
    JSON.stringify({
      price: published.flatMap((section) => section.items).find((item) => item.name === "VINNY'S BURGER").price,
      name: (await content.getSettings()).restaurant_name.value,
      emails: (await content.listInquiries()).map((row) => row.email),
    }),
  );
} else {
  throw new Error(`unknown command ${command}`);
}
