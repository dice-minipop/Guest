const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

// 항상 이 패키지 디렉터리를 프로젝트 루트로 사용 (모노레포에서 루트로 해석되는 문제 방지)
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.join(projectRoot, "node_modules"),
  path.join(monorepoRoot, "node_modules"),
];

module.exports = config;
