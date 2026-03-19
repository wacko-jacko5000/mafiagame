import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { moduleCatalog } from "./game-modules";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const modulesRoot = path.resolve(currentDir, "../../../apps/api/src/modules");
const requiredFiles = ["README.md", "RULES.md", "API.md", "TESTPLAN.md"];

describe("backend module documentation", () => {
  it("exists for every module in the shared catalog", () => {
    for (const module of moduleCatalog) {
      const moduleRoot = path.join(modulesRoot, module.key);
      for (const requiredFile of requiredFiles) {
        expect(
          existsSync(path.join(moduleRoot, requiredFile)),
          `${module.key} is missing ${requiredFile}`
        ).toBe(true);
      }
    }
  });
});
