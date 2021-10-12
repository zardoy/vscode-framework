// manually

// Isn't precise TODO extract from schema too
interface ICommand {
    command: string
    title: string

    category?: string
}

interface IConfigurationProperty {
    enum?: string[]
    description: string
    type: string | string[]
    default?: any
}

interface IConfiguration {
    title?: string
    order?: number
    properties: Record<string, IConfigurationProperty>
}

interface IDebugger {
    label?: string
    type: string
    runtime?: string
}

interface IGrammar {
    language: string
}

interface IJSONValidation {
    fileMatch: string | string[]
    url: string
}

interface IKeyBinding {
    command: string
    key: string
    when?: string
    mac?: string
    linux?: string
    win?: string
}

interface ILanguage {
    id: string
    extensions: string[]
    aliases: string[]
}

interface IMenu {
    command: string
    alt?: string
    when?: string
    group?: string
}

interface ISnippet {
    language: string
}

interface ITheme {
    label: string
}

interface IViewContainer {
    id: string
    title: string
}

interface IView {
    id: string
    name: string
}

interface IColor {
    id: string
    description: string
    defaults: { light: string; dark: string; highContrast: string }
}

interface IExtensionContributions {
    commands?: ICommand[]
    configuration?: IConfiguration | IConfiguration[]
    debuggers?: IDebugger[]
    grammars?: IGrammar[]
    jsonValidation?: IJSONValidation[]
    keybindings?: IKeyBinding[]
    languages?: ILanguage[]
    menus?: Record<string, IMenu[]>
    snippets?: ISnippet[]
    themes?: ITheme[]
    iconThemes?: ITheme[]
    productIconThemes?: ITheme[]
    viewsContainers?: Record<string, IViewContainer[]>
    views?: Record<string, IView[]>
    colors?: IColor[]
    // localizations?: ILocalization[];
    // readonly customEditors?: readonly IWebviewEditor[];
    // readonly codeActions?: readonly ICodeActionContribution[];
    // authentication?: IAuthenticationContribution[];
    // walkthroughs?: IWalkthrough[];
    // startEntries?: IStartEntry[];
    // readonly notebookRenderer?: INotebookRendererContribution[];
}

type ExtensionCategory = [
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
]

// auto-generated via quicktype -s schema
/** Auto-generated. It extends standard packageJson type */
export interface ExtensionManifest {
    /**
     * Activation events for the VS Code extension.
     */
    activationEvents?: string[]
    /**
     * Array of badges to display in the sidebar of the Marketplace's extension page.
     */
    badges?: Badge[]
    /**
     * Declare the set of supported capabilities by the extension.
     */
    capabilities?: Capabilities
    /**
     * The categories used by the VS Code gallery to categorize the extension.
     */
    categories?: Array<ExtensionCategory[number]>
    /**
     * All contributions of the VS Code extension represented by this package.
     */
    contributes?: IExtensionContributions
    /**
     * The display name for the extension used in the VS Code gallery.
     */
    displayName: string
    /**
     * Engine compatibility.
     */
    engines?: Engines
    /**
     * Dependencies to other extensions. The identifier of an extension is always
     * ${publisher}.${name}. For example: vscode.csharp.
     */
    extensionDependencies?: string[]
    /**
     * Define the kind of an extension. `ui` extensions are installed and run on the local
     * machine while `workspace` extensions run on the remote.
     */
    extensionKind?: ExtensionKind[]
    /**
     * A set of extensions that can be installed together. The identifier of an extension is
     * always ${publisher}.${name}. For example: vscode.csharp.
     */
    extensionPack?: string[]
    /**
     * Banner used in the VS Code marketplace.
     */
    galleryBanner?: GalleryBanner
    /**
     * The path to a 128x128 pixel icon.
     */
    icon?: string
    /**
     * Controls the Markdown rendering engine used in the Marketplace. Either github (default)
     * or standard.
     */
    markdown?: Markdown
    /**
     * Sets the extension to be flagged as a Preview in the Marketplace.
     */
    preview?: boolean
    /**
     * The publisher of the VS Code extension.
     */
    publisher?: string
    /**
     * Controls the Q&A link in the Marketplace. Set to marketplace to enable the default
     * Marketplace Q & A site. Set to a string to provide the URL of a custom Q & A site. Set to
     * false to disable Q & A altogether.
     */
    qna?: boolean | string
    scripts?: Scripts
}

interface Badge {
    /**
     * Badge description.
     */
    description: string
    /**
     * Badge link.
     */
    href: string
    /**
     * Badge image URL.
     */
    url: string
}

/**
 * Declare the set of supported capabilities by the extension.
 */
interface Capabilities {
    /**
     * Declares how the extension should be handled in untrusted workspaces.
     */
    untrustedWorkspaces?: UntrustedWorkspaces
    /**
     * Declares whether the extension should be enabled in virtual workspaces. A virtual
     * workspace is a workspace which is not backed by any on-disk resources. When false, this
     * extension will be automatically disabled in virtual workspaces. Default is true.
     */
    virtualWorkspaces?: boolean | VirtualWorkspacesObject
}

/**
 * Declares how the extension should be handled in untrusted workspaces.
 */
interface UntrustedWorkspaces {
    description?: string
    /**
     * A list of configuration keys contributed by the extension that should not use workspace
     * values in untrusted workspaces.
     */
    restrictedConfigurations?: string[]
    supported: boolean | SupportedEnum
}

enum SupportedEnum {
    Limited = 'limited',
}

interface VirtualWorkspacesObject {
    description?: string
    supported?: boolean | SupportedEnum
}

/**
 * Engine compatibility.
 */
interface Engines {
    /**
     * For VS Code extensions, specifies the VS Code version that the extension is compatible
     * with. Cannot be *. For example: ^0.10.5 indicates compatibility with a minimum VS Code
     * version of 0.10.5.
     */
    vscode?: string
}

enum ExtensionKind {
    UI = 'ui',
    Web = 'web',
    Workspace = 'workspace',
}

/**
 * Banner used in the VS Code marketplace.
 */
interface GalleryBanner {
    /**
     * The banner color on the VS Code marketplace page header.
     */
    color?: string
    /**
     * The color theme for the font used in the banner.
     */
    theme?: Theme
}

/**
 * The color theme for the font used in the banner.
 */
enum Theme {
    Dark = 'dark',
    Light = 'light',
}

/**
 * Controls the Markdown rendering engine used in the Marketplace. Either github (default)
 * or standard.
 */
enum Markdown {
    Github = 'github',
    Standard = 'standard',
}

interface Scripts {
    /**
     * Script executed before the package is published as a VS Code extension.
     */
    'vscode:prepublish'?: string
    /**
     * Uninstall hook for VS Code extension. Script that gets executed when the extension is
     * completely uninstalled from VS Code which is when VS Code is restarted (shutdown and
     * start) after the extension is uninstalled. Only Node scripts are supported.
     */
    'vscode:uninstall'?: string
}
