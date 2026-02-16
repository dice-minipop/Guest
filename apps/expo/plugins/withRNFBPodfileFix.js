const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * expo-build-properties가 Podfile.properties.json에 ios.buildReactNativeFromSource를
 * 넣지 않는 경우를 대비해, prebuild 후 해당 값을 추가합니다.
 * RNFB non-modular 헤더 에러 회피용 공식 워크어라운드 (expo/expo#39607).
 */
function withRNFBPodfileFix(config) {
  return withDangerousMod(config, [
    "ios",
    async (cfg) => {
      const propsPath = path.join(cfg.modRequest.platformProjectRoot, "Podfile.properties.json");

      if (!fs.existsSync(propsPath)) return cfg;

      const props = JSON.parse(fs.readFileSync(propsPath, "utf8"));
      if (props["ios.buildReactNativeFromSource"] === "true") return cfg;

      props["ios.buildReactNativeFromSource"] = "true";
      fs.writeFileSync(propsPath, JSON.stringify(props, null, 2));
      return cfg;
    },
  ]);
}

module.exports = withRNFBPodfileFix;
