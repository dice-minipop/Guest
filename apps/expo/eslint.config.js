// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  require("eslint-config-prettier"),
  { ignores: ["dist/*"] },
  {
    files: ["eslint.config.js"],
    languageOptions: {
      globals: { __dirname: "readonly" },
    },
  },
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
  },
]);
