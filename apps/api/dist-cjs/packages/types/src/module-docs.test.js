"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const node_url_1 = require("node:url");
const vitest_1 = require("vitest");
const game_modules_1 = require("./game-modules");
const currentDir = node_path_1.default.dirname((0, node_url_1.fileURLToPath)(import.meta.url));
const modulesRoot = node_path_1.default.resolve(currentDir, "../../../apps/api/src/modules");
const requiredFiles = ["README.md", "RULES.md", "API.md", "TESTPLAN.md"];
(0, vitest_1.describe)("backend module documentation", () => {
    (0, vitest_1.it)("exists for every module in the shared catalog", () => {
        for (const module of game_modules_1.moduleCatalog) {
            const moduleRoot = node_path_1.default.join(modulesRoot, module.key);
            for (const requiredFile of requiredFiles) {
                (0, vitest_1.expect)((0, node_fs_1.existsSync)(node_path_1.default.join(moduleRoot, requiredFile)), `${module.key} is missing ${requiredFile}`).toBe(true);
            }
        }
    });
});
