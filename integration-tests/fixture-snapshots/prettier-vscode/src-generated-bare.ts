export interface RegularCommands {
    "createConfigFile": true
    "forceFormatDocument": true
}


export interface Configuration {
    arrowParens?:                "always" | "avoid";
    bracketSpacing?:             boolean;
    configPath?:                 string;
    disableLanguages?:           string[];
    documentSelectors?:          string[];
    embeddedLanguageFormatting?: "auto" | "off";
    enable?:                     boolean;
    enableDebugLogs?:            boolean;
    endOfLine?:                  "auto" | "cr" | "crlf" | "lf";
    htmlWhitespaceSensitivity?:  "css" | "ignore" | "strict";
    ignorePath?:                 string;
    insertPragma?:               boolean;
    jsxBracketSameLine?:         boolean;
    jsxSingleQuote?:             boolean;
    packageManager?:             "npm" | "pnpm" | "yarn";
    prettierPath?:               string;
    printWidth?:                 number;
    proseWrap?:                  "always" | "never" | "preserve";
    quoteProps?:                 "as-needed" | "consistent" | "preserve";
    requireConfig?:              boolean;
    requirePragma?:              boolean;
    resolveGlobalModules?:       boolean;
    semi?:                       boolean;
    singleQuote?:                boolean;
    tabWidth?:                   number;
    trailingComma?:              "all" | "es5" | "none";
    useEditorConfig?:            boolean;
    useTabs?:                    boolean;
    vueIndentScriptAndStyle?:    boolean;
    withNodeModules?:            boolean;
}

export {}
