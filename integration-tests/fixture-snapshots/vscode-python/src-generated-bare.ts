export interface RegularCommands {
    "analysis.restartLanguageServer": true
    "clearPersistentStorage": true
    "clearWorkspaceInterpreter": true
    "configureTests": true
    "createTerminal": true
    "enableLinting": true
    "enableSourceMapSupport": true
    "execInTerminal": true
    "execInTerminal-icon": true
    "debugInTerminal": true
    "execSelectionInDjangoShell": true
    "execSelectionInTerminal": true
    "goToPythonObject": true
    "launchTensorBoard": true
    "refreshTensorBoard": true
    "refreshTests": true
    "refreshingTests": true
    "stopRefreshingTests": true
    "reportIssue": true
    "reRunFailTests": true
    "runLinting": true
    "setInterpreter": true
    "setLinter": true
    "sortImports": true
    "startREPL": true
    "switchOffInsidersChannel": true
    "switchToDailyChannel": true
    "switchToWeeklyChannel": true
    "viewLanguageServerOutput": true
    "viewOutput": true
}


export interface Configuration {
    /**
     * List of paths to libraries and the like that need to be imported by auto complete engine.
     * E.g. when using Google App SDK, the paths are not in system path, hence need to be added
     * into this list.
     */
    "autoComplete.extraPaths"?: any[];
    /**
     * Path to the conda executable to use for activation (version 4.4+).
     */
    condaPath?: string;
    /**
     * Path to Python, you can use a custom version of Python by modifying this setting to
     * include the full path. This default setting is used as a fallback if no interpreter is
     * selected for the workspace. The extension will also not set nor change the value of this
     * setting, it will only read from it.
     */
    defaultInterpreterPath?: string;
    /**
     * Enable source map support for meaningful stack traces in error logs.
     */
    "diagnostics.sourceMapsEnabled"?: boolean;
    /**
     * Whether to check if Python is installed (also warn when using the macOS-installed Python).
     */
    disableInstallationCheck?: boolean;
    /**
     * Absolute path to a file containing environment variable definitions.
     */
    envFile?: string;
    /**
     * Enables A/B tests experiments in the Python extension. If enabled, you may get included
     * in proposed enhancements and/or features.
     */
    "experiments.enabled"?: boolean;
    /**
     * List of experiment to opt into. If empty, user is assigned the default experiment groups.
     * See https://github.com/microsoft/vscode-python/wiki/Experiments for more details.
     */
    "experiments.optInto"?: "All" | "pythonDeprecatePythonPath" | "pythonSurveyNotification" | "pythonTensorboardExperiment"[];
    /**
     * List of experiment to opt out of. If empty, user is assigned the default experiment
     * groups. See https://github.com/microsoft/vscode-python/wiki/Experiments for more details.
     */
    "experiments.optOutFrom"?: "All" | "pythonDeprecatePythonPath" | "pythonSurveyNotification" | "pythonTensorboardExperiment"[];
    /**
     * Arguments passed in. Each argument is a separate item in the array.
     */
    "formatting.autopep8Args"?: string[];
    /**
     * Path to autopep8, you can use a custom version of autopep8 by modifying this setting to
     * include the full path.
     */
    "formatting.autopep8Path"?: string;
    /**
     * Arguments passed in. Each argument is a separate item in the array.
     */
    "formatting.blackArgs"?: string[];
    /**
     * Path to Black, you can use a custom version of Black by modifying this setting to include
     * the full path.
     */
    "formatting.blackPath"?: string;
    /**
     * Provider for formatting. Possible options include 'autopep8', 'black', and 'yapf'.
     */
    "formatting.provider"?: "autopep8" | "black" | "none" | "yapf";
    /**
     * Arguments passed in. Each argument is a separate item in the array.
     */
    "formatting.yapfArgs"?: string[];
    /**
     * Path to yapf, you can use a custom version of yapf by modifying this setting to include
     * the full path.
     */
    "formatting.yapfPath"?: string;
    /**
     * Whether to install Python modules globally when not using an environment.
     */
    globalModuleInstallation?: boolean;
    /**
     * Set to "weekly" or "daily" to automatically download and install the latest Insiders
     * builds of the python extension, which include upcoming features and bug fixes.
     */
    insidersChannel?: "daily" | "off" | "weekly";
    /**
     * Defines type of the language server.
     */
    languageServer?: "Default" | "Jedi" | "None" | "Pylance";
    /**
     * Arguments passed in. Each argument is a separate item in the array.
     */
    "linting.banditArgs"?: string[];
    /**
     * Whether to lint Python files using bandit.
     */
    "linting.banditEnabled"?: boolean;
    /**
     * Path to bandit, you can use a custom version of bandit by modifying this setting to
     * include the full path.
     */
    "linting.banditPath"?: string;
    /**
     * Optional working directory for linters.
     */
    "linting.cwd"?: string;
    /**
     * Whether to lint Python files.
     */
    "linting.enabled"?: boolean;
    /**
     * Arguments passed in. Each argument is a separate item in the array.
     */
    "linting.flake8Args"?: string[];
    /**
     * Severity of Flake8 message type 'E'.
     */
    "linting.flake8CategorySeverity.E"?: "Error" | "Hint" | "Information" | "Warning";
    /**
     * Severity of Flake8 message type 'F'.
     */
    "linting.flake8CategorySeverity.F"?: "Error" | "Hint" | "Information" | "Warning";
    /**
     * Severity of Flake8 message type 'W'.
     */
    "linting.flake8CategorySeverity.W"?: "Error" | "Hint" | "Information" | "Warning";
    /**
     * Whether to lint Python files using flake8
     */
    "linting.flake8Enabled"?: boolean;
    /**
     * Path to flake8, you can use a custom version of flake8 by modifying this setting to
     * include the full path.
     */
    "linting.flake8Path"?: string;
    /**
     * Patterns used to exclude files or folders from being linted.
     */
    "linting.ignorePatterns"?: string[];
    /**
     * Whether to lint Python files when saved.
     */
    "linting.lintOnSave"?: boolean;
    /**
     * Controls the maximum number of problems produced by the server.
     */
    "linting.maxNumberOfProblems"?: number;
    /**
     * Arguments passed in. Each argument is a separate item in the array.
     */
    "linting.mypyArgs"?: string[];
    /**
     * Severity of Mypy message type 'Error'.
     */
    "linting.mypyCategorySeverity.error"?: "Error" | "Hint" | "Information" | "Warning";
    /**
     * Severity of Mypy message type 'Note'.
     */
    "linting.mypyCategorySeverity.note"?: "Error" | "Hint" | "Information" | "Warning";
    /**
     * Whether to lint Python files using mypy.
     */
    "linting.mypyEnabled"?: boolean;
    /**
     * Path to mypy, you can use a custom version of mypy by modifying this setting to include
     * the full path.
     */
    "linting.mypyPath"?: string;
    /**
     * Arguments passed in. Each argument is a separate item in the array.
     */
    "linting.prospectorArgs"?: string[];
    /**
     * Whether to lint Python files using prospector.
     */
    "linting.prospectorEnabled"?: boolean;
    /**
     * Path to Prospector, you can use a custom version of prospector by modifying this setting
     * to include the full path.
     */
    "linting.prospectorPath"?: string;
    /**
     * Arguments passed in. Each argument is a separate item in the array.
     */
    "linting.pycodestyleArgs"?: string[];
    /**
     * Severity of pycodestyle message type 'E'.
     */
    "linting.pycodestyleCategorySeverity.E"?: "Error" | "Hint" | "Information" | "Warning";
    /**
     * Severity of pycodestyle message type 'W'.
     */
    "linting.pycodestyleCategorySeverity.W"?: "Error" | "Hint" | "Information" | "Warning";
    /**
     * Whether to lint Python files using pycodestyle
     */
    "linting.pycodestyleEnabled"?: boolean;
    /**
     * Path to pycodestyle, you can use a custom version of pycodestyle by modifying this
     * setting to include the full path.
     */
    "linting.pycodestylePath"?: string;
    /**
     * Arguments passed in. Each argument is a separate item in the array.
     */
    "linting.pydocstyleArgs"?: string[];
    /**
     * Whether to lint Python files using pydocstyle
     */
    "linting.pydocstyleEnabled"?: boolean;
    /**
     * Path to pydocstyle, you can use a custom version of pydocstyle by modifying this setting
     * to include the full path.
     */
    "linting.pydocstylePath"?: string;
    /**
     * Arguments passed in. Each argument is a separate item in the array.
     */
    "linting.pylamaArgs"?: string[];
    /**
     * Whether to lint Python files using pylama.
     */
    "linting.pylamaEnabled"?: boolean;
    /**
     * Path to pylama, you can use a custom version of pylama by modifying this setting to
     * include the full path.
     */
    "linting.pylamaPath"?: string;
    /**
     * Arguments passed in. Each argument is a separate item in the array.
     */
    "linting.pylintArgs"?: string[];
    /**
     * Severity of Pylint message type 'Convention/C'.
     */
    "linting.pylintCategorySeverity.convention"?: "Error" | "Hint" | "Information" | "Warning";
    /**
     * Severity of Pylint message type 'Error/E'.
     */
    "linting.pylintCategorySeverity.error"?: "Error" | "Hint" | "Information" | "Warning";
    /**
     * Severity of Pylint message type 'Fatal/F'.
     */
    "linting.pylintCategorySeverity.fatal"?: "Error" | "Hint" | "Information" | "Warning";
    /**
     * Severity of Pylint message type 'Refactor/R'.
     */
    "linting.pylintCategorySeverity.refactor"?: "Error" | "Hint" | "Information" | "Warning";
    /**
     * Severity of Pylint message type 'Warning/W'.
     */
    "linting.pylintCategorySeverity.warning"?: "Error" | "Hint" | "Information" | "Warning";
    /**
     * Whether to lint Python files using pylint.
     */
    "linting.pylintEnabled"?: boolean;
    /**
     * Path to Pylint, you can use a custom version of pylint by modifying this setting to
     * include the full path.
     */
    "linting.pylintPath"?: string;
    /**
     * The logging level the extension logs at, defaults to 'error'
     */
    "logging.level"?: "debug" | "error" | "info" | "off" | "warn";
    /**
     * Path to the pipenv executable to use for activation.
     */
    pipenvPath?: string;
    /**
     * Path to the poetry executable.
     */
    poetryPath?: string;
    /**
     * (DEPRECATED: Note this setting is not used when in pythonDeprecatePythonPath experiment)
     * Path to Python, you can use a custom version of Python by modifying this setting to
     * include the full path.
     */
    pythonPath?: string;
    /**
     * Arguments passed in. Each argument is a separate item in the array.
     */
    "sortImports.args"?: string[];
    /**
     * Path to isort script, default using inner version
     */
    "sortImports.path"?: string;
    /**
     * Set this setting to your preferred TensorBoard log directory to skip log directory prompt
     * when starting TensorBoard.
     */
    "tensorBoard.logDirectory"?: string;
    /**
     * Activate Python Environment in the current Terminal on load of the Extension.
     */
    "terminal.activateEnvInCurrentTerminal"?: boolean;
    /**
     * Activate Python Environment in Terminal created using the Extension.
     */
    "terminal.activateEnvironment"?: boolean;
    /**
     * When executing a file in the terminal, whether to use execute in the file's directory,
     * instead of the current open folder.
     */
    "terminal.executeInFileDir"?: boolean;
    /**
     * Python launch arguments to use when executing a file in the terminal.
     */
    "terminal.launchArgs"?: any[];
    /**
     * Enable auto run test discovery when saving a test file.
     */
    "testing.autoTestDiscoverOnSaveEnabled"?: boolean;
    /**
     * Optional working directory for tests.
     */
    "testing.cwd"?: string;
    /**
     * Port number used for debugging of tests.
     */
    "testing.debugPort"?: number;
    /**
     * Prompt to configure a test framework if potential tests directories are discovered.
     */
    "testing.promptToConfigure"?: boolean;
    /**
     * Arguments passed in. Each argument is a separate item in the array.
     */
    "testing.pytestArgs"?: string[];
    /**
     * Enable testing using pytest.
     */
    "testing.pytestEnabled"?: boolean;
    /**
     * Path to pytest (pytest), you can use a custom version of pytest by modifying this setting
     * to include the full path.
     */
    "testing.pytestPath"?: string;
    /**
     * Arguments passed in. Each argument is a separate item in the array.
     */
    "testing.unittestArgs"?: string[];
    /**
     * Enable testing using unittest.
     */
    "testing.unittestEnabled"?: boolean;
    /**
     * Folders in your home directory to look into for virtual environments (supports pyenv,
     * direnv and virtualenvwrapper by default).
     */
    venvFolders?: string[];
    /**
     * Path to folder with a list of Virtual Environments (e.g. ~/.pyenv, ~/Envs,
     * ~/.virtualenvs).
     */
    venvPath?: string;
}
export {}
