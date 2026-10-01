import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const unitsDir = path.join(repoRoot, "data", "units");
const unitsIndexPath = path.join(repoRoot, "data", "units.json");
const schemaPath = path.join(repoRoot, "schemas", "unit.schema.json");

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await fs.access(unitsDir);
  await fs.access(schemaPath);

  const entries = await fs.readdir(unitsDir, { withFileTypes: true });
  const unitFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".json"));

  // Values the published Unit type allows (types/unit.d.ts).
  const blockingValues = new Set(["Full", "Partial", "None"]);
  const problems = [];

  for (const entry of unitFiles) {
    const raw = await fs.readFile(path.join(unitsDir, entry.name), "utf8");
    const unit = JSON.parse(raw);
    if (unit.blocking !== undefined && !blockingValues.has(unit.blocking)) {
      problems.push(`${entry.name}: blocking "${unit.blocking}" must be one of ${[...blockingValues].join(", ")}`);
    }
  }

  if (problems.length > 0) {
    throw new Error(`Invalid unit data:\n${problems.join("\n")}`);
  }

  if (await fileExists(unitsIndexPath)) {
    const raw = await fs.readFile(unitsIndexPath, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("data/units.json must be a JSON array");
    }
  }

  console.log(`Validated ${unitFiles.length} per-unit files`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
