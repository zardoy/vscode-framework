export interface RegularCommands {
    "executeAutofix": true
    "createConfig": true
    "showOutputChannel": true
    "migrateSettings": true
    "restart": true
}


export interface Configuration {
    /**
     * Always show the ESlint status bar item.
     */
    alwaysShowStatus?: boolean;
    /**
     * Turns auto fix on save on or off.
     */
    autoFixOnSave?:                   boolean;
    "codeAction.disableRuleComment"?: CodeActionDisableRuleComment;
    "codeAction.showDocumentation"?:  CodeActionShowDocumentation;
    "codeActionsOnSave.mode"?:        "all" | "problems";
    "codeActionsOnSave.rules"?:       string[];
    debug?:                           boolean;
    /**
     * Controls whether eslint is enabled or not.
     */
    enable?:   boolean;
    execArgv?: string[];
    /**
     * Enables ESLint as a formatter.
     */
    "format.enable"?: boolean;
    /**
     * Controls whether a task for linting the whole workspace will be available.
     */
    "lintTask.enable"?:  boolean;
    "lintTask.options"?: string;
    /**
     * Whether ESlint should migrate auto fix on save settings.
     */
    "migration.2_x"?: "off" | "on";
    nodeEnv?:         null | string;
    nodePath?:        null | string;
    /**
     * Whether ESLint should issue a warning on ignored files.
     */
    onIgnoredFiles?: "off" | "warn";
    options?:        { [key: string]: any };
    /**
     * The package manager you use to install node modules.
     */
    packageManager?: "npm" | "pnpm" | "yarn";
    /**
     * An array of language ids for which the extension should probe if support is installed.
     */
    probe?: string[];
    /**
     * Controls whether a task for linting the whole workspace will be available.
     */
    provideLintTask?: boolean;
    /**
     * Turns on quiet mode, which ignores warnings.
     */
    quiet?: boolean;
    /**
     * Override the severity of one or more rules reported by this extension, regardless of the
     * project's ESLint config. Use globs to apply default severities for multiple rules.
     */
    "rules.customizations"?: RulesCustomization[];
    /**
     * "onSave" | "onType" the linter on save (onSave) or on type (onType)
     */
    run?:     "onSave" | "onType";
    runtime?: null | string;
    /**
     * Traces the communication between VSCode and the eslint linter service.
     */
    "trace.server"?: "messages" | "off" | "verbose" | TraceServerObject;
    /**
     * Since version 7 ESLint offers a new API call ESLint. Use it even if the old CLIEngine is
     * available. From version 8 on forward on ESLint class is available.
     */
    useESLintClass?: boolean;
    /**
     * An array of language ids which should be validated by ESLint. If not installed ESLint
     * will show an error.
     */
    validate?:           Array<ValidateObject | string>;
    workingDirectories?: Array<WorkingDirectoryObject | string>;
}

export interface CodeActionDisableRuleComment {
    /**
     * Show the disable code actions.
     */
    enable?: boolean;
    /**
     * Configure the disable rule code action to insert the comment on the same line or a new
     * line.
     */
    location?: "sameLine" | "separateLine";
}
export interface CodeActionShowDocumentation {
    /**
     * Show the documentation code actions.
     */
    enable?: boolean;
}
export interface RulesCustomization {
    rule?:     string;
    severity?: "default" | "downgrade" | "error" | "info" | "off" | "upgrade" | "warn";
}

export interface TraceServerObject {
    format?:    "json" | "text";
    verbosity?: "messages" | "off" | "verbose";
}
export interface ValidateObject {
    /**
     * Whether auto fixes are provided for the language.
     */
    autoFix?: boolean;
    /**
     * The language id to be validated by ESLint.
     */
    language?: string;
}

export interface WorkingDirectoryObject {
    mode?: "auto" | "location";
    /**
     * Whether the process's cwd should be changed as well.
     */
    changeProcessCWD?: boolean;
    /**
     * The working directory to use if a file's path starts with this directory.
     */
    directory?: string;
    /**
     * Set to true if ESLint shouldn't change the working directory.
     */
    "!cwd"?: boolean;
    /**
     * A glob pattern to match a working directory.
     */
    pattern?: string;
}
export {}
