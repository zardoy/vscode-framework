interface ICommand {
    command: string;
    title: string;

    category?: string;
}

interface IConfigurationProperty {
    enum?: string[];
    description: string;
    type: string | string[];
    default?: any;
}

interface IConfiguration {
    properties: Record<string, IConfigurationProperty>;
}

interface IDebugger {
    label?: string;
    type: string;
    runtime?: string;
}

interface IGrammar {
    language: string;
}

interface IJSONValidation {
    fileMatch: string | string[];
    url: string;
}

interface IKeyBinding {
    command: string;
    key: string;
    when?: string;
    mac?: string;
    linux?: string;
    win?: string;
}

interface ILanguage {
    id: string;
    extensions: string[];
    aliases: string[];
}

interface IMenu {
    command: string;
    alt?: string;
    when?: string;
    group?: string;
}

interface ISnippet {
    language: string;
}

interface ITheme {
    label: string;
}

interface IViewContainer {
    id: string;
    title: string;
}

interface IView {
    id: string;
    name: string;
}

interface IColor {
    id: string;
    description: string;
    defaults: { light: string; dark: string; highContrast: string };
}

export type BasicExtensionPackageType = {
    name: string;
    publisher: string;
    displayName: string;
    contributes: {
        commands: {

        };
    };
    engines: {
        vscode: string;
    };
    repository: string;
};

export const EXTENSION_CATEGORIES = [
    'Azure',
    'Data Science',
    'Debuggers',
    'Extension Packs',
    'Education',
    'Formatters',
    'Keymaps',
    'Language Packs',
    'Linters',
    'Machine Learning',
    'Notebooks',
    'Programming Languages',
    'SCM Providers',
    'Snippets',
    'Testing',
    'Themes',
    'Visualization',
    'Other',
] as const;

export type ExtensionKind = 'ui' | 'workspace' | 'web';

// export type ExtensionUntrustedWorkspaceSupport = { supported: true } | { supported: false; description: string } | { supported: LimitedWorkspaceSupportType; description: string; restrictedConfigurations?: string[] };

// export type ExtensionVirtualWorkspaceSupport = boolean | { supported: true } | { supported: false | LimitedWorkspaceSupportType; description: string };

export interface IExtensionCapabilities {
    // readonly virtualWorkspaces?: ExtensionVirtualWorkspaceSupport;
    // readonly untrustedWorkspaces?: ExtensionUntrustedWorkspaceSupport;
}

interface IExtensionContributions {
    commands?: ICommand[];
    configuration?: IConfiguration | IConfiguration[];
    debuggers?: IDebugger[];
    grammars?: IGrammar[];
    jsonValidation?: IJSONValidation[];
    keybindings?: IKeyBinding[];
    languages?: ILanguage[];
    menus?: Record<string, IMenu[]>;
    snippets?: ISnippet[];
    themes?: ITheme[];
    iconThemes?: ITheme[];
    productIconThemes?: ITheme[];
    viewsContainers?: Record<string, IViewContainer[]>;
    views?: Record<string, IView[]>;
    colors?: IColor[];
    // localizations?: ILocalization[];
    // readonly customEditors?: readonly IWebviewEditor[];
    // readonly codeActions?: readonly ICodeActionContribution[];
    // authentication?: IAuthenticationContribution[];
    // walkthroughs?: IWalkthrough[];
    // startEntries?: IStartEntry[];
    // readonly notebookRenderer?: INotebookRendererContribution[];
}

export interface ExtensionManifest {
    name: string;
    displayName: string;
    publisher: string;
    version: string;
    engines: { vscode: string };
    description?: string;
    main?: string;
    browser?: string;
    icon?: string;
    categories?: typeof EXTENSION_CATEGORIES[number];
    keywords?: string[];
    activationEvents?: string[];
    extensionDependencies?: string[];
    extensionPack?: string[];
    extensionKind?: ExtensionKind | ExtensionKind[];
    contributes?: IExtensionContributions;
    repository?: string;
    enableProposedApi?: boolean;
    api?: string;
    scripts?: Record<string, string>;
    capabilities?: IExtensionCapabilities;
}
