/**
 * Conservative bbox for potrace-style paths after translate(0,H) scale(s,-s).
 */

export function boundsAfterPotraceTransform(paths, canvasHeight = 110, scale = 0.1) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  const bumpUser = (ux, uy) => {
    const x = scale * ux;
    const y = canvasHeight - scale * uy;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  };

  for (const d of paths) {
    let x = 0;
    let y = 0;
    const tokens = d
      .replace(/([MmLlHhVvCcSsQqTtAaZz])/g, " $1 ")
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean);

    let i = 0;
    let cmd = "";
    const nextNum = () => {
      const v = Number(tokens[i++]);
      if (Number.isNaN(v)) throw new Error(`Bad path token in ${d.slice(0, 40)}…`);
      return v;
    };

    while (i < tokens.length) {
      const t = tokens[i];
      if (/^[A-Za-z]$/.test(t)) {
        cmd = t;
        i++;
        continue;
      }
      if (!cmd) throw new Error("Path missing initial command");

      if (cmd === "M") {
        x = nextNum();
        y = nextNum();
        bumpUser(x, y);
        cmd = "L";
      } else if (cmd === "m") {
        x += nextNum();
        y += nextNum();
        bumpUser(x, y);
        cmd = "l";
      } else if (cmd === "L") {
        x = nextNum();
        y = nextNum();
        bumpUser(x, y);
      } else if (cmd === "l") {
        x += nextNum();
        y += nextNum();
        bumpUser(x, y);
      } else if (cmd === "c") {
        bumpUser(x + nextNum(), y + nextNum());
        bumpUser(x + nextNum(), y + nextNum());
        x += nextNum();
        y += nextNum();
        bumpUser(x, y);
      } else if (cmd === "C") {
        bumpUser(nextNum(), nextNum());
        bumpUser(nextNum(), nextNum());
        x = nextNum();
        y = nextNum();
        bumpUser(x, y);
      } else if (cmd === "z" || cmd === "Z") {
        continue;
      } else {
        throw new Error(`Unsupported path command ${cmd}`);
      }
    }
  }

  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
}

export function viewBoxFromBounds(bounds, pad = 3) {
  const x = Math.floor(bounds.minX - pad);
  const y = Math.floor(bounds.minY - pad);
  const w = Math.ceil(bounds.width + pad * 2);
  const h = Math.ceil(bounds.height + pad * 2);
  return { viewBox: `${x} ${y} ${w} ${h}`, width: w, height: h };
}

/** Union potrace path extrema (control points) with raster ink trim, then pad all sides. */
export function displayViewBoxUnion(paths, inkBBox, canvasHeight = 110, scale = 0.1, pad = 12) {
  const path = boundsAfterPotraceTransform(paths, canvasHeight, scale);
  const minX = Math.min(path.minX, inkBBox.x);
  const minY = Math.min(path.minY, inkBBox.y);
  const maxX = Math.max(path.maxX, inkBBox.x + inkBBox.width);
  const maxY = Math.max(path.maxY, inkBBox.y + inkBBox.height);
  const x = Math.floor(minX - pad);
  const y = Math.floor(minY - pad);
  const w = Math.ceil(maxX - minX + pad * 2);
  const h = Math.ceil(maxY - minY + pad * 2);
  return { viewBox: `${x} ${y} ${w} ${h}`, width: w, height: h, minX: x, minY: y, maxX: x + w, maxY: y + h };
}