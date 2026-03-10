import * as Expo from "@expo/config-plugins";
import detectIndent, { type Indent } from "detect-indent";
import { HTMLElement } from "node-html-parser";
import type { Options as PrettierOptions } from "prettier";
import { type Sharp } from "sharp";
import { type XMLFormatterOptions } from "xml-formatter";
export declare const PACKAGE_NAME = "react-native-bootsplash";
export declare const setIsExpo: (value: boolean) => void;
export declare const log: {
    error: (text: string) => void;
    title: (emoji: string, text: string) => void;
    warn: (text: string) => void;
    write: (filePath: string, dimensions?: {
        width: number;
        height: number;
    }) => void;
};
export declare const hfs: {
    buffer: (path: string) => NonSharedBuffer;
    exists: (path: string) => boolean;
    isDir: (path: string) => boolean;
    json: (path: string) => unknown;
    readDir: (path: string) => string[];
    realPath: (path: string) => string;
    rm: (path: string) => void;
    text: (path: string) => string;
    ensureDir: (dir: string) => void;
    write: (path: string, content: string) => void;
};
export declare const writeJson: (filePath: string, content: object) => void;
type FormatOptions = {
    indent?: Indent;
} & ({
    formatter: "prettier";
    selfClosingTags?: boolean;
    useCssPlugin?: boolean;
    htmlWhitespaceSensitivity?: PrettierOptions["htmlWhitespaceSensitivity"];
    singleAttributePerLine?: PrettierOptions["singleAttributePerLine"];
} | {
    formatter: "xmlFormatter";
    whiteSpaceAtEndOfSelfclosingTag?: XMLFormatterOptions["whiteSpaceAtEndOfSelfclosingTag"];
});
export declare const readXmlLike: (filePath: string) => {
    root: HTMLElement;
    formatOptions: {
        indent: detectIndent.Indent;
    };
};
export declare const writeXmlLike: (filePath: string, content: string, { indent, ...formatOptions }: FormatOptions) => Promise<void>;
export type Asset = {
    path: string;
    image: Sharp;
    hash: string;
    height: number;
    width: number;
};
export type RawProps = {
    logo: string;
    background: string;
    logoWidth: number;
    assetsOutput: string;
    licenseKey?: string;
    brand?: string;
    brandWidth: number;
    darkBackground?: string;
    darkLogo?: string;
    darkBrand?: string;
    android?: {
        darkContentBarsStyle?: boolean;
    };
};
export declare const transformProps: (rootPath: string, { android, licenseKey, ...rawProps }: RawProps) => Promise<{
    android: {
        darkContentBarsStyle?: boolean;
    };
    assetsOutputPath: string;
    licenseKey: string | undefined;
    executeAddon: boolean;
    background: {
        hex: string;
        rgb: {
            R: string;
            G: string;
            B: string;
        };
    };
    darkBackground: {
        hex: string;
        rgb: {
            R: string;
            G: string;
            B: string;
        };
    } | undefined;
    logo: Asset;
    darkLogo: Asset | undefined;
    brand: Asset | undefined;
    darkBrand: Asset | undefined;
    fileNameSuffix: string;
}>;
export type Props = Awaited<ReturnType<typeof transformProps>>;
export declare const writeAndroidAssets: ({ androidOutputPath, props, }: {
    androidOutputPath: string;
    props: Props;
}) => Promise<void>;
export declare const writeIOSAssets: ({ iosOutputPath, props, }: {
    iosOutputPath: string;
    props: Props;
}) => Promise<void>;
export declare const writeWebAssets: ({ htmlTemplatePath, props, }: {
    htmlTemplatePath: string;
    props: Props;
}) => Promise<void>;
export declare const writeGenericAssets: ({ props }: {
    props: Props;
}) => Promise<void>;
export type AddonConfig = {
    props: Props;
    androidOutputPath: string | undefined;
    iosOutputPath: string | undefined;
    htmlTemplatePath: string | undefined;
};
export declare const requireAddon: ({ executeAddon, licenseKey, }: Props) => {
    execute: (config: AddonConfig) => Promise<void>;
    writeAndroidAssets: (_: {
        androidOutputPath: string;
        props: Props;
    }) => Promise<void>;
    writeIOSAssets: (_: {
        iosOutputPath: string;
        props: Props;
    }) => Promise<void>;
    writeWebAssets: (_: {
        htmlTemplatePath: string;
        props: Props;
    }) => Promise<void>;
    writeGenericAssets: (_: {
        props: Props;
    }) => Promise<void>;
    withAndroidColorsNight: (_: {
        config: Expo.ExportedConfigWithProps;
        props: Props;
    }) => Promise<Expo.ExportedConfigWithProps>;
} | undefined;
export declare const generate: ({ platforms, html, flavor, plist, ...rawProps }: {
    platforms: Array<"android" | "ios" | "web">;
    html: string;
    flavor: string;
    plist?: string;
    logo: string;
    background: string;
    logoWidth: number;
    assetsOutput: string;
    licenseKey?: string;
    brand?: string;
    brandWidth: number;
    darkBackground?: string;
    darkLogo?: string;
    darkBrand?: string;
}) => Promise<void>;
export {};
//# sourceMappingURL=generate.d.ts.map