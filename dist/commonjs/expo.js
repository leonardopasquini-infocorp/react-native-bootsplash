"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withBootSplash = void 0;
var Expo = _interopRequireWildcard(require("@expo/config-plugins"));
var _Colors = require("@expo/config-plugins/build/android/Colors");
var _codeMod = require("@expo/config-plugins/build/android/codeMod");
var _generateCode = require("@expo/config-plugins/build/utils/generateCode");
var _child_process = _interopRequireDefault(require("child_process"));
var _path = _interopRequireDefault(require("path"));
var _semver = _interopRequireDefault(require("semver"));
var _tsDedent = require("ts-dedent");
var _util = _interopRequireDefault(require("util"));
var _generate = require("./generate");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const promisifiedExec = _util.default.promisify(_child_process.default.exec);
const exec = cmd => promisifiedExec(cmd).then(({
  stdout,
  stderr
}) => stdout || stderr);
const withoutExpoSplashScreen = Expo.createRunOncePlugin(expoConfig => expoConfig, "expo-splash-screen", "skip");
const withAndroidAssets = (expoConfig, rawProps) => Expo.withDangerousMod(expoConfig, ["android", async config => {
  const {
    platformProjectRoot,
    projectRoot
  } = config.modRequest;
  const props = await (0, _generate.transformProps)(projectRoot, rawProps);
  const addon = (0, _generate.requireAddon)(props);
  const androidOutputPath = _path.default.resolve(platformProjectRoot, "app", "src", "main", "res");
  await (0, _generate.writeAndroidAssets)({
    androidOutputPath,
    props
  });
  await addon?.writeAndroidAssets({
    androidOutputPath,
    props
  });
  return config;
}]);
const withAndroidManifest = expoConfig => Expo.withAndroidManifest(expoConfig, config => {
  config.modResults.manifest.application?.forEach(application => {
    if (application.$["android:name"] === ".MainApplication") {
      const {
        activity
      } = application;
      activity?.forEach(activity => {
        if (activity.$["android:name"] === ".MainActivity") {
          activity.$["android:theme"] = "@style/BootTheme";
        }
      });
    }
  });
  return config;
});
const withMainActivity = expoConfig => Expo.withMainActivity(expoConfig, config => {
  const {
    modResults
  } = config;
  const withImports = (0, _codeMod.addImports)(modResults.contents.replace(/(\/\/ )?setTheme\(R\.style\.AppTheme\)/, "// setTheme(R.style.AppTheme)"), ["android.os.Bundle", "com.zoontek.rnbootsplash.RNBootSplash"], false);

  // indented with 4 spaces
  const withInit = (0, _generateCode.mergeContents)({
    src: withImports,
    comment: "    //",
    tag: "bootsplash-init",
    offset: 0,
    anchor: /super\.onCreate\((null|savedInstanceState)\)/,
    newSrc: "    RNBootSplash.init(this, R.style.BootTheme)"
  });
  return {
    ...config,
    modResults: {
      ...modResults,
      contents: withInit.contents
    }
  };
});
const withAndroidStyles = (expoConfig, rawProps) => Expo.withAndroidStyles(expoConfig, async config => {
  const {
    projectRoot
  } = config.modRequest;
  const {
    android,
    brand
  } = await (0, _generate.transformProps)(projectRoot, rawProps);
  const {
    darkContentBarsStyle
  } = android;
  const {
    modResults
  } = config;
  const {
    resources
  } = modResults;
  const {
    style = []
  } = resources;
  const item = [{
    $: {
      name: "postBootSplashTheme"
    },
    _: "@style/AppTheme"
  }, {
    $: {
      name: "bootSplashBackground"
    },
    _: "@color/bootsplash_background"
  }, {
    $: {
      name: "bootSplashLogo"
    },
    _: "@drawable/bootsplash_logo"
  }];
  if (brand != null) {
    item.push({
      $: {
        name: "bootSplashBrand"
      },
      _: "@drawable/bootsplash_brand"
    });
  }
  if (darkContentBarsStyle != null) {
    item.push({
      $: {
        name: "darkContentBarsStyle"
      },
      _: String(darkContentBarsStyle)
    });
  }
  const withBootTheme = [...style.filter(({
    $
  }) => $.name !== "BootTheme"), {
    $: {
      name: "BootTheme",
      parent: "Theme.BootSplash"
    },
    item
  }];
  return {
    ...config,
    modResults: {
      ...modResults,
      resources: {
        ...resources,
        style: withBootTheme
      }
    }
  };
});
const withAndroidColors = (expoConfig, rawProps) => Expo.withAndroidColors(expoConfig, async config => {
  const {
    projectRoot
  } = config.modRequest;
  const {
    background
  } = await (0, _generate.transformProps)(projectRoot, rawProps);
  config.modResults = (0, _Colors.assignColorValue)(config.modResults, {
    name: "bootsplash_background",
    value: background.hex
  });
  return config;
});
const withAndroidColorsNight = (expoConfig, rawProps) => Expo.withAndroidColorsNight(expoConfig, async config => {
  const {
    projectRoot
  } = config.modRequest;
  const props = await (0, _generate.transformProps)(projectRoot, rawProps);
  const addon = (0, _generate.requireAddon)(props);
  return addon != null ? await addon.withAndroidColorsNight({
    config,
    props
  }) : config;
});
const withIOSAssets = (expoConfig, rawProps) => Expo.withDangerousMod(expoConfig, ["ios", async config => {
  const {
    platformProjectRoot,
    projectName = "",
    projectRoot
  } = config.modRequest;
  const props = await (0, _generate.transformProps)(projectRoot, rawProps);
  const addon = (0, _generate.requireAddon)(props);
  const iosOutputPath = _path.default.resolve(platformProjectRoot, projectName);
  await (0, _generate.writeIOSAssets)({
    iosOutputPath,
    props
  });
  await addon?.writeIOSAssets({
    iosOutputPath,
    props
  });
  return config;
}]);
const withAppDelegate = expoConfig => Expo.withAppDelegate(expoConfig, config => {
  const {
    modResults
  } = config;
  const {
    language
  } = modResults;
  if (language !== "swift") {
    throw new Error(`Cannot modify the project AppDelegate as it's not in a supported language: ${language}`);
  }
  const withHeader = (0, _generateCode.mergeContents)({
    src: modResults.contents,
    comment: "//",
    tag: "bootsplash-header",
    offset: 1,
    anchor: /import Expo/,
    newSrc: "import RNBootSplash"
  });
  const withRootView = (0, _generateCode.mergeContents)({
    src: withHeader.contents,
    comment: "//",
    tag: "bootsplash-init",
    offset: 1,
    anchor: /class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {/,
    newSrc: (0, _tsDedent.dedent)`
        public override func customize(_ rootView: UIView) {
          super.customize(rootView)
          RNBootSplash.initWithStoryboard("BootSplash", rootView: rootView)
        }
      `
  });
  return {
    ...config,
    modResults: {
      ...modResults,
      contents: withRootView.contents
    }
  };
});
const withInfoPlist = expoConfig => Expo.withInfoPlist(expoConfig, config => {
  config.modResults["UILaunchStoryboardName"] = "BootSplash";
  return config;
});
const withXcodeProject = expoConfig => Expo.withXcodeProject(expoConfig, config => {
  const {
    projectName = ""
  } = config.modRequest;
  Expo.IOSConfig.XcodeUtils.addResourceFileToGroup({
    filepath: _path.default.join(projectName, "BootSplash.storyboard"),
    groupName: projectName,
    project: config.modResults,
    isBuildFile: true
  });
  Expo.IOSConfig.XcodeUtils.addResourceFileToGroup({
    filepath: _path.default.join(projectName, "Colors.xcassets"),
    groupName: projectName,
    project: config.modResults,
    isBuildFile: true
  });
  return config;
});
const withWebAssets = (expoConfig, rawProps) => Expo.withDangerousMod(expoConfig, [expoConfig.platforms?.includes("ios") ? "ios" : "android", async config => {
  const {
    projectRoot
  } = config.modRequest;
  const props = await (0, _generate.transformProps)(projectRoot, rawProps);
  const addon = (0, _generate.requireAddon)(props);
  const fileName = "public/index.html";
  const htmlTemplatePath = _path.default.resolve(projectRoot, fileName);
  if (!_generate.hfs.exists(htmlTemplatePath)) {
    await exec(`npx expo customize ${fileName}`);
  }
  await (0, _generate.writeWebAssets)({
    htmlTemplatePath,
    props
  });
  await addon?.writeWebAssets({
    htmlTemplatePath,
    props
  });
  return config;
}]);
const withGenericAssets = (expoConfig, rawProps) => Expo.withDangerousMod(expoConfig, [expoConfig.platforms?.includes("ios") ? "ios" : "android", async config => {
  const {
    projectRoot
  } = config.modRequest;
  const props = await (0, _generate.transformProps)(projectRoot, rawProps);
  const addon = (0, _generate.requireAddon)(props);
  await (0, _generate.writeGenericAssets)({
    props
  });
  await addon?.writeGenericAssets({
    props
  });
  return config;
}]);
const withBootSplash = exports.withBootSplash = Expo.createRunOncePlugin((expoConfig, baseProps) => {
  const {
    platforms = [],
    sdkVersion = "0.1.0"
  } = expoConfig;
  (0, _generate.setIsExpo)(true);
  if (_semver.default.lt(sdkVersion, "54.0.0")) {
    _generate.log.error("Requires Expo 54.0.0 (or higher)");
    process.exit(1);
  }
  if (!baseProps?.logo) {
    _generate.log.error("Missing required parameter 'logo'");
    process.exit(1);
  }
  const rawProps = {
    assetsOutput: "assets/bootsplash",
    background: "#fff",
    brandWidth: 80,
    logoWidth: 100,
    ...baseProps
  };
  const plugins = [withoutExpoSplashScreen, withGenericAssets];
  if (platforms.includes("android")) {
    plugins.push(withAndroidAssets, withAndroidManifest, withMainActivity, withAndroidStyles, withAndroidColors, withAndroidColorsNight);
  }
  if (platforms.includes("ios")) {
    plugins.push(withIOSAssets, withAppDelegate, withInfoPlist, withXcodeProject);
  }
  if (platforms.includes("web")) {
    plugins.push(withWebAssets);
  }
  return Expo.withPlugins(expoConfig, plugins.map(plugin => [plugin, rawProps]));
}, _generate.PACKAGE_NAME);
//# sourceMappingURL=expo.js.map