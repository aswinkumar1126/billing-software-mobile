// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Mirrors the "@/*" -> "./src/*" path alias declared in tsconfig.json.
// Metro doesn't read tsconfig `paths` on its own, so it's wired up here too.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "@": path.resolve(__dirname, "src"),
};

module.exports = config;
