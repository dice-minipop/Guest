const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

// 모노레포 루트에서 실행돼도 항상 Expo 앱( apps/expo )을 프로젝트 루트로 사용
const projectRoot = path.resolve(__dirname, "apps/expo");
const config = getDefaultConfig(projectRoot);

config.watchFolders = [__dirname];
config.resolver.nodeModulesPaths = [
  path.join(projectRoot, "node_modules"),
  path.join(__dirname, "node_modules"),
];

module.exports = config;
