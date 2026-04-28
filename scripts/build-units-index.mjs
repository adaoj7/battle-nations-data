import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const unitsDir = path.join(repoRoot, "data", "units");
const unitsIndexPath = path.join(repoRoot, "data", "units.json");

async function main() {
  const entries = await fs.readdir(unitsDir, { withFileTypes: true });
  const unitFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10));

  const units = [];

  for (const fileName of unitFiles) {
    const filePath = path.join(unitsDir, fileName);
    const raw = await fs.readFile(filePath, "utf8");
    units.push(JSON.parse(raw));
  }

  await fs.writeFile(unitsIndexPath, `${JSON.stringify(units, null, 2)}\n`, "utf8");
  console.log(`Wrote ${unitFiles.length} unit records to ${unitsIndexPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
