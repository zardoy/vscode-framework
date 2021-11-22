declare module 'vscode-framework' {
    interface RegularCommands {
        "prettier.createConfigFile": true
        "prettier.forceFormatDocument": true
    }
    interface Settings extends Required<ConfigurationObject> {}
}

interface ConfigurationObject {
    "prettier.arrowParens"?:                PrettierArrowParens;
    "prettier.bracketSpacing"?:             boolean;
    "prettier.configPath"?:                 string;
    "prettier.disableLanguages"?:           string[];
    "prettier.documentSelectors"?:          string[];
    "prettier.embeddedLanguageFormatting"?: PrettierEmbeddedLanguageFormatting;
    "prettier.enable"?:                     boolean;
    "prettier.enableDebugLogs"?:            boolean;
    "prettier.endOfLine"?:                  PrettierEndOfLine;
    "prettier.htmlWhitespaceSensitivity"?:  PrettierHTMLWhitespaceSensitivity;
    "prettier.ignorePath"?:                 string;
    "prettier.insertPragma"?:               boolean;
    "prettier.jsxBracketSameLine"?:         boolean;
    "prettier.jsxSingleQuote"?:             boolean;
    "prettier.packageManager"?:             PrettierPackageManager;
    "prettier.prettierPath"?:               string;
    "prettier.printWidth"?:                 number;
    "prettier.proseWrap"?:                  PrettierProseWrap;
    "prettier.quoteProps"?:                 PrettierQuoteProps;
    "prettier.requireConfig"?:              boolean;
    "prettier.requirePragma"?:              boolean;
    "prettier.resolveGlobalModules"?:       boolean;
    "prettier.semi"?:                       boolean;
    "prettier.singleQuote"?:                boolean;
    "prettier.tabWidth"?:                   number;
    "prettier.trailingComma"?:              PrettierTrailingComma;
    "prettier.useEditorConfig"?:            boolean;
    "prettier.useTabs"?:                    boolean;
    "prettier.vueIndentScriptAndStyle"?:    boolean;
    "prettier.withNodeModules"?:            boolean;
}

type PrettierArrowParens =
    "always" |
    "avoid"

type PrettierEmbeddedLanguageFormatting =
    "auto" |
    "off"

type PrettierEndOfLine =
    "auto" |
    "cr" |
    "crlf" |
    "lf"

type PrettierHTMLWhitespaceSensitivity =
    "css" |
    "ignore" |
    "strict"

type PrettierPackageManager =
    "npm" |
    "pnpm" |
    "yarn"

type PrettierProseWrap =
    "always" |
    "never" |
    "preserve"

type PrettierQuoteProps =
    "as-needed" |
    "consistent" |
    "preserve"

type PrettierTrailingComma =
    "all" |
    "es5" |
    "none"

export {}
