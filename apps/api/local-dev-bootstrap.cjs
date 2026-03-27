const Module = require("module");
const path = require("path");

const originalResolveFilename = Module._resolveFilename;
const compiledConfigEntry = path.resolve(
  __dirname,
  "dist-cjs",
  "packages",
  "config",
  "src",
  "index.js"
);

Module._resolveFilename = function patchedResolveFilename(
  request,
  parent,
  isMain,
  options
) {
  if (request === "@mafia-game/config") {
    return compiledConfigEntry;
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};

require(path.resolve(__dirname, "dist-cjs", "apps", "api", "src", "main.js"));
