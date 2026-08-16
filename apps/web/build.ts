import { join } from "node:path";
import tailwind from "bun-plugin-tailwind";

const root = import.meta.dir;

const result = await Bun.build({
  entrypoints: [join(root, "index.html")],
  outdir: join(root, "../../dist"),
  target: "browser",
  minify: true,
  sourcemap: "linked",
  plugins: [tailwind],
});

if (!result.success) {
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

console.log("Built to dist/");
