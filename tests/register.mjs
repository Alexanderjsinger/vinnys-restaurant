import { register } from "node:module";

register(new URL("./load-lib.mjs", import.meta.url).href, import.meta.url);
