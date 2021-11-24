declare module "vscode" {
    type ExtensionCommands = "eslint.executeAutofix" | "eslint.createConfig" | "eslint.showOutputChannel" | "eslint.migrateSettings" | "eslint.restart"
    export namespace commands {
        export function executeCommand<T = unknown>(command: ExtensionCommands, ...rest: any[]): Thenable<T>
        export function registerCommand(
            command: ExtensionCommands,
            callback: (...args: any[]) => any,
            thisArg?: any,
        ): Disposable
        export function registerTextEditorCommand(
            command: ExtensionCommands,
            callback: (textEditor: TextEditor, edit: TextEditorEdit, ...args: any[]) => void,
            thisArg?: any,
        ): Disposable
    }


    export namespace workspace {
        export function getConfiguration(
            section: 'eslint',
            scope?: ConfigurationScope | null,
        ): {
            /**
             * Return a value from this configuration.
             *
             * @param section Configuration name, supports _dotted_ names.
             * @return The value `section` denotes or `undefined`.
             */
            get<K extends keyof Configuration, T extends Configuration[K]>(section: K): T | undefined

            /**
             * Return a value from this configuration.
             *
             * @param section Configuration name, supports _dotted_ names.
             * @param defaultValue A value should be returned when no value could be found, is `undefined`.
             * @return The value `section` denotes or the default.
             */
            get<K extends keyof Configuration, T extends Configuration[K]>(section: K, defaultValue: T): T

            /**
             * Check if this configuration has a certain value.
             *
             * @param section Configuration name, supports _dotted_ names.
             * @return `true` if the section doesn't resolve to `undefined`.
             */
            has<K extends keyof Configuration>(section: K): boolean

            /**
             * Retrieve all information about a configuration setting. A configuration value
             * often consists of a *default* value, a global or installation-wide value,
             * a workspace-specific value, folder-specific value
             * and language-specific values (if {@link WorkspaceConfiguration} is scoped to a language).
             *
             * Also provides all language ids under which the given configuration setting is defined.
             *
             * *Note:* The configuration name must denote a leaf in the configuration tree
             * (`editor.fontSize` vs `editor`) otherwise no result is returned.
             *
             * @param section Configuration name, supports _dotted_ names.
             * @return Information about a configuration setting or `undefined`.
             */
            inspect<K extends keyof Configuration, T extends Configuration[K]>(
                section: K,
            ):
                | {
                        key: K

                        defaultValue?: T
                        globalValue?: T
                        workspaceValue?: T
                        workspaceFolderValue?: T

                        defaultLanguageValue?: T
                        globalLanguageValue?: T
                        workspaceLanguageValue?: T
                        workspaceFolderLanguageValue?: T

                        languageIds?: string[]
                    }
                | undefined

            /**
             * Update a configuration value. The updated configuration values are persisted.
             *
             * A value can be changed in
             *
             * - {@link ConfigurationTarget.Global Global settings}: Changes the value for all instances of the editor.
             * - {@link ConfigurationTarget.Workspace Workspace settings}: Changes the value for current workspace, if available.
             * - {@link ConfigurationTarget.WorkspaceFolder Workspace folder settings}: Changes the value for settings from one of the {@link workspace.workspaceFolders Workspace Folders} under which the requested resource belongs to.
             * - Language settings: Changes the value for the requested languageId.
             *
             * *Note:* To remove a configuration value use `undefined`, like so: `config.update('somekey', undefined)`
             *
             * @param section Configuration name, supports _dotted_ names.
             * @param value The new value.
             * @param configurationTarget The {@link ConfigurationTarget configuration target} or a boolean value.
             *	- If `true` updates {@link ConfigurationTarget.Global Global settings}.
                *	- If `false` updates {@link ConfigurationTarget.Workspace Workspace settings}.
                *	- If `undefined` or `null` updates to {@link ConfigurationTarget.WorkspaceFolder Workspace folder settings} if configuration is resource specific,
                * 	otherwise to {@link ConfigurationTarget.Workspace Workspace settings}.
                * @param overrideInLanguage Whether to update the value in the scope of requested languageId or not.
                *	- If `true` updates the value under the requested languageId.
                *	- If `undefined` updates the value under the requested languageId only if the configuration is defined for the language.
                * @throws error while updating
                *	- configuration which is not registered.
                *	- window configuration to workspace folder
                *	- configuration to workspace or workspace folder when no workspace is opened.
                *	- configuration to workspace folder when there is no workspace folder settings.
                *	- configuration to workspace folder when {@link WorkspaceConfiguration} is not scoped to a resource.
                */
            update<K extends keyof Configuration, T extends Configuration[K]>(
                section: K,
                value: T,
                configurationTarget?: ConfigurationTarget | boolean | null,
                overrideInLanguage?: boolean,
            ): Thenable<void>
        } & Readonly<Record<string, string>>
    }
}

interface Configuration {
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
    "eslint.codeActionsOnSave.mode"?:        "all" | "problems";
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
    "eslint.migration.2_x"?: "off" | "on";
    "eslint.nodeEnv"?:       null | string;
    "eslint.nodePath"?:      null | string;
    /**
     * Whether ESLint should issue a warning on ignored files.
     */
    "eslint.onIgnoredFiles"?: "off" | "warn";
    "eslint.options"?:        { [key: string]: any };
    /**
     * The package manager you use to install node modules.
     */
    "eslint.packageManager"?: "npm" | "pnpm" | "yarn";
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
    "eslint.run"?:     "onSave" | "onType";
    "eslint.runtime"?: null | string;
    /**
     * Traces the communication between VSCode and the eslint linter service.
     */
    "eslint.trace.server"?: "messages" | "off" | "verbose" | EslintTraceServerObject;
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
    location?: "sameLine" | "separateLine";
}
export interface EslintCodeActionShowDocumentation {
    /**
     * Show the documentation code actions.
     */
    enable?: boolean;
}
export interface EslintRulesCustomization {
    rule?:     string;
    severity?: "default" | "downgrade" | "error" | "info" | "off" | "upgrade" | "warn";
}

export interface EslintTraceServerObject {
    format?:    "json" | "text";
    verbosity?: "messages" | "off" | "verbose";
}
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
