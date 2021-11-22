declare module 'vscode-framework' {
    interface RegularCommands {
        "eslint.executeAutofix": true
        "eslint.createConfig": true
        "eslint.showOutputChannel": true
        "eslint.migrateSettings": true
        "eslint.restart": true
    }
    interface Settings extends Required<ConfigurationObject> {}
}

interface ConfigurationObject {
    /**
     * Always show the ESlint status bar item.
     */
    "eslint.alwaysShowStatus"?: boolean;
    /**
     * Turns auto fix on save on or off.
     */
    "eslint.autoFixOnSave"?:                 boolean;
    "eslint.codeAction.disableRuleComment"?: EslintCodeActionDisableRuleComment;
    "eslint.codeAction.showDocumentation"?:  EslintCodeActionShowDocumentation;
    "eslint.codeActionsOnSave.mode"?:        EslintCodeActionsOnSaveMode;
    "eslint.codeActionsOnSave.rules"?:       string[];
    "eslint.debug"?:                         boolean;
    /**
     * Controls whether eslint is enabled or not.
     */
    "eslint.enable"?:   boolean;
    "eslint.execArgv"?: string[];
    /**
     * Enables ESLint as a formatter.
     */
    "eslint.format.enable"?: boolean;
    /**
     * Controls whether a task for linting the whole workspace will be available.
     */
    "eslint.lintTask.enable"?:  boolean;
    "eslint.lintTask.options"?: string;
    /**
     * Whether ESlint should migrate auto fix on save settings.
     */
    "eslint.migration.2_x"?: EslintMigration2_X;
    "eslint.nodeEnv"?:       null | string;
    "eslint.nodePath"?:      null | string;
    /**
     * Whether ESLint should issue a warning on ignored files.
     */
    "eslint.onIgnoredFiles"?: EslintOnIgnoredFiles;
    "eslint.options"?:        { [key: string]: any };
    /**
     * The package manager you use to install node modules.
     */
    "eslint.packageManager"?: EslintPackageManager;
    /**
     * An array of language ids for which the extension should probe if support is installed.
     */
    "eslint.probe"?: string[];
    /**
     * Controls whether a task for linting the whole workspace will be available.
     */
    "eslint.provideLintTask"?: boolean;
    /**
     * Turns on quiet mode, which ignores warnings.
     */
    "eslint.quiet"?: boolean;
    /**
     * Override the severity of one or more rules reported by this extension, regardless of the
     * project's ESLint config. Use globs to apply default severities for multiple rules.
     */
    "eslint.rules.customizations"?: EslintRulesCustomization[];
    /**
     * Run the linter on save (onSave) or on type (onType)
     */
    "eslint.run"?:     EslintRun;
    "eslint.runtime"?: null | string;
    /**
     * Traces the communication between VSCode and the eslint linter service.
     */
    "eslint.trace.server"?: Verbosity | EslintTraceServerObject;
    /**
     * Since version 7 ESLint offers a new API call ESLint. Use it even if the old CLIEngine is
     * available. From version 8 on forward on ESLint class is available.
     */
    "eslint.useESLintClass"?: boolean;
    /**
     * An array of language ids which should be validated by ESLint. If not installed ESLint
     * will show an error.
     */
    "eslint.validate"?:           Array<EslintValidateObject | string>;
    "eslint.workingDirectories"?: Array<EslintWorkingDirectoryObject | string>;
}

export interface EslintCodeActionDisableRuleComment {
    /**
     * Show the disable code actions.
     */
    enable?: boolean;
    /**
     * Configure the disable rule code action to insert the comment on the same line or a new
     * line.
     */
    location?: Location;
}

type Location =
    "sameLine" |
    "separateLine"

export interface EslintCodeActionShowDocumentation {
    /**
     * Show the documentation code actions.
     */
    enable?: boolean;
}

type EslintCodeActionsOnSaveMode =
    "all" |
    "problems"

type EslintMigration2_X =
    "off" |
    "on"

type EslintOnIgnoredFiles =
    "off" |
    "warn"

type EslintPackageManager =
    "npm" |
    "pnpm" |
    "yarn"

export interface EslintRulesCustomization {
    rule?:     string;
    severity?: Severity;
}

type Severity =
    "default" |
    "downgrade" |
    "error" |
    "info" |
    "off" |
    "upgrade" |
    "warn"

type EslintRun =
    "onSave" |
    "onType"

type Verbosity =
    "messages" |
    "off" |
    "verbose"

export interface EslintTraceServerObject {
    format?:    Format;
    verbosity?: Verbosity;
}

type Format =
    "json" |
    "text"

export interface EslintValidateObject {
    /**
     * Whether auto fixes are provided for the language.
     */
    autoFix?: boolean;
    /**
     * The language id to be validated by ESLint.
     */
    language?: string;
}

export interface EslintWorkingDirectoryObject {
    mode?: Mode;
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

type Mode =
    "auto" |
    "location"

export {}
