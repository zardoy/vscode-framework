declare module 'vscode-framework' {
    interface RegularCommands {
        "vscode-docker.compose.down": true
        "vscode-docker.compose.restart": true
        "vscode-docker.compose.up": true
        "vscode-docker.compose.up.subset": true
        "vscode-docker.configure": true
        "vscode-docker.configureCompose": true
        "vscode-docker.installDocker": true
        "vscode-docker.containers.attachShell": true
        "vscode-docker.containers.browse": true
        "vscode-docker.containers.configureExplorer": true
        "vscode-docker.containers.downloadFile": true
        "vscode-docker.containers.inspect": true
        "vscode-docker.containers.openFile": true
        "vscode-docker.containers.prune": true
        "vscode-docker.containers.refresh": true
        "vscode-docker.containers.remove": true
        "vscode-docker.containers.restart": true
        "vscode-docker.containers.select": true
        "vscode-docker.containers.start": true
        "vscode-docker.containers.stop": true
        "vscode-docker.containers.stats": true
        "vscode-docker.containers.viewLogs": true
        "vscode-docker.containers.composeGroup.logs": true
        "vscode-docker.containers.composeGroup.start": true
        "vscode-docker.containers.composeGroup.stop": true
        "vscode-docker.containers.composeGroup.restart": true
        "vscode-docker.containers.composeGroup.down": true
        "vscode-docker.debugging.initializeForDebugging": true
        "vscode-docker.images.build": true
        "vscode-docker.images.configureExplorer": true
        "vscode-docker.images.inspect": true
        "vscode-docker.images.prune": true
        "vscode-docker.images.showDangling": true
        "vscode-docker.images.pull": true
        "vscode-docker.images.push": true
        "vscode-docker.images.refresh": true
        "vscode-docker.images.remove": true
        "vscode-docker.images.run": true
        "vscode-docker.images.runAzureCli": true
        "vscode-docker.images.runInteractive": true
        "vscode-docker.images.tag": true
        "vscode-docker.images.copyFullTag": true
        "vscode-docker.networks.configureExplorer": true
        "vscode-docker.networks.create": true
        "vscode-docker.networks.inspect": true
        "vscode-docker.networks.prune": true
        "vscode-docker.networks.refresh": true
        "vscode-docker.networks.remove": true
        "vscode-docker.pruneSystem": true
        "vscode-docker.registries.azure.buildImage": true
        "vscode-docker.registries.azure.createRegistry": true
        "vscode-docker.registries.azure.deleteRegistry": true
        "vscode-docker.registries.azure.deleteRepository": true
        "vscode-docker.registries.azure.openInPortal": true
        "vscode-docker.registries.azure.runFileAsTask": true
        "vscode-docker.registries.azure.runTask": true
        "vscode-docker.registries.azure.selectSubscriptions": true
        "vscode-docker.registries.azure.untagImage": true
        "vscode-docker.registries.azure.viewProperties": true
        "vscode-docker.registries.azure.viewTaskLogs": true
        "vscode-docker.registries.connectRegistry": true
        "vscode-docker.registries.copyImageDigest": true
        "vscode-docker.registries.deleteImage": true
        "vscode-docker.registries.deployImageToAzure": true
        "vscode-docker.registries.deployImageToAci": true
        "vscode-docker.registries.disconnectRegistry": true
        "vscode-docker.registries.dockerHub.openInBrowser": true
        "vscode-docker.registries.help": true
        "vscode-docker.registries.logInToDockerCli": true
        "vscode-docker.registries.logOutOfDockerCli": true
        "vscode-docker.registries.pullImage": true
        "vscode-docker.registries.pullRepository": true
        "vscode-docker.registries.reconnectRegistry": true
        "vscode-docker.registries.refresh": true
        "vscode-docker.volumes.configureExplorer": true
        "vscode-docker.volumes.inspect": true
        "vscode-docker.volumes.prune": true
        "vscode-docker.volumes.refresh": true
        "vscode-docker.volumes.remove": true
        "vscode-docker.help": true
        "vscode-docker.help.reportIssue": true
        "vscode-docker.help.openWalkthrough": true
        "vscode-docker.contexts.use": true
        "vscode-docker.contexts.remove": true
        "vscode-docker.contexts.inspect": true
        "vscode-docker.contexts.configureExplorer": true
        "vscode-docker.contexts.refresh": true
        "vscode-docker.contexts.help": true
        "vscode-docker.contexts.create.aci": true
    }
    interface Settings extends Required<ConfigurationObject> {}
}

interface ConfigurationObject {
    /**
     * %vscode-docker.config.docker.certPath%
     */
    "docker.certPath"?: string;
    /**
     * %vscode-docker.config.template.attach.description%
     */
    "docker.commands.attach"?: Array<any[] | boolean | number | number | null | DockerCommandsAttachObject | string> | string;
    /**
     * %vscode-docker.config.template.build.description%
     */
    "docker.commands.build"?: Array<any[] | boolean | number | number | null | DockerCommandsBuildObject | string> | string;
    /**
     * %vscode-docker.config.template.composeDown.description%
     */
    "docker.commands.composeDown"?: Array<any[] | boolean | number | number | null | DockerCommandsComposeDownObject | string> | string;
    /**
     * %vscode-docker.config.template.composeUp.description%
     */
    "docker.commands.composeUp"?: Array<any[] | boolean | number | number | null | DockerCommandsComposeUpObject | string> | string;
    /**
     * %vscode-docker.config.template.composeUpSubset.description%
     */
    "docker.commands.composeUpSubset"?: Array<any[] | boolean | number | number | null | DockerCommandsComposeUpSubsetObject | string> | string;
    /**
     * %vscode-docker.config.template.logs.description%
     */
    "docker.commands.logs"?: Array<any[] | boolean | number | number | null | DockerCommandsLogObject | string> | string;
    /**
     * %vscode-docker.config.template.run.description%
     */
    "docker.commands.run"?: Array<any[] | boolean | number | number | null | DockerCommandsRunObject | string> | string;
    /**
     * %vscode-docker.config.template.runInteractive.description%
     */
    "docker.commands.runInteractive"?: Array<any[] | boolean | number | number | null | DockerCommandsRunInteractiveObject | string> | string;
    /**
     * %vscode-docker.config.docker.containers.description%
     */
    "docker.containers.description"?: DockerContainersLabel[];
    /**
     * %vscode-docker.config.docker.containers.groupBy%
     */
    "docker.containers.groupBy"?: DockerContainersGroupBy;
    /**
     * %vscode-docker.config.docker.containers.label%
     */
    "docker.containers.label"?: DockerContainersLabel;
    /**
     * %vscode-docker.config.docker.containers.sortBy%
     */
    "docker.containers.sortBy"?: DockerSSortBy;
    /**
     * %vscode-docker.config.docker.context%
     */
    "docker.context"?: string;
    /**
     * %vscode-docker.config.docker.contexts.description%
     */
    "docker.contexts.description"?: DockerContextsLabel[];
    /**
     * %vscode-docker.config.docker.contexts.label%
     */
    "docker.contexts.label"?: DockerContextsLabel;
    /**
     * %vscode-docker.config.docker.dockerComposeBuild%
     */
    "docker.dockerComposeBuild"?: boolean;
    /**
     * %vscode-docker.config.docker.dockerComposeDetached%
     */
    "docker.dockerComposeDetached"?: boolean;
    /**
     * %vscode-docker.config.docker.dockerodeOptions%
     */
    "docker.dockerodeOptions"?: { [key: string]: any };
    /**
     * %vscode-docker.config.docker.dockerPath%
     */
    "docker.dockerPath"?: string;
    /**
     * %vscode-docker.config.docker.enableDockerComposeLanguageService%
     */
    "docker.enableDockerComposeLanguageService"?: boolean;
    /**
     * %vscode-docker.config.docker.explorerRefreshInterval%
     */
    "docker.explorerRefreshInterval"?: number;
    /**
     * %vscode-docker.config.docker.host%
     */
    "docker.host"?: string;
    /**
     * %vscode-docker.config.docker.imageBuildContextPath%
     */
    "docker.imageBuildContextPath"?: string;
    /**
     * %vscode-docker.config.docker.images.checkForOutdatedImages%
     */
    "docker.images.checkForOutdatedImages"?: boolean;
    /**
     * %vscode-docker.config.docker.images.description%
     */
    "docker.images.description"?: DockerImagesLabel[];
    /**
     * %vscode-docker.config.docker.images.groupBy%
     */
    "docker.images.groupBy"?: DockerImagesGroupBy;
    /**
     * %vscode-docker.config.docker.images.label%
     */
    "docker.images.label"?: DockerImagesLabel;
    /**
     * %vscode-docker.config.docker.images.sortBy%
     */
    "docker.images.sortBy"?: DockerImagesSortBy;
    /**
     * %vscode-docker.config.docker.languageserver.diagnostics.deprecatedMaintainer%
     */
    "docker.languageserver.diagnostics.deprecatedMaintainer"?: DockerLanguageserverDiagnostics;
    /**
     * %vscode-docker.config.docker.languageserver.diagnostics.directiveCasing%
     */
    "docker.languageserver.diagnostics.directiveCasing"?: DockerLanguageserverDiagnostics;
    /**
     * %vscode-docker.config.docker.languageserver.diagnostics.emptyContinuationLine%
     */
    "docker.languageserver.diagnostics.emptyContinuationLine"?: DockerLanguageserverDiagnostics;
    /**
     * %vscode-docker.config.docker.languageserver.diagnostics.instructionCasing%
     */
    "docker.languageserver.diagnostics.instructionCasing"?: DockerLanguageserverDiagnostics;
    /**
     * %vscode-docker.config.docker.languageserver.diagnostics.instructionCmdMultiple%
     */
    "docker.languageserver.diagnostics.instructionCmdMultiple"?: DockerLanguageserverDiagnostics;
    /**
     * %vscode-docker.config.docker.languageserver.diagnostics.instructionEntrypointMultiple%
     */
    "docker.languageserver.diagnostics.instructionEntrypointMultiple"?: DockerLanguageserverDiagnostics;
    /**
     * %vscode-docker.config.docker.languageserver.diagnostics.instructionHealthcheckMultiple%
     */
    "docker.languageserver.diagnostics.instructionHealthcheckMultiple"?: DockerLanguageserverDiagnostics;
    /**
     * %vscode-docker.config.docker.languageserver.diagnostics.instructionJsonInSingleQuotes%
     */
    "docker.languageserver.diagnostics.instructionJSONInSingleQuotes"?: DockerLanguageserverDiagnostics;
    /**
     * %vscode-docker.config.docker.languageserver.diagnostics.instructionWorkdirRelative%
     */
    "docker.languageserver.diagnostics.instructionWorkdirRelative"?: DockerLanguageserverDiagnostics;
    /**
     * %vscode-docker.config.docker.languageserver.formatter.ignoreMultilineInstructions%
     */
    "docker.languageserver.formatter.ignoreMultilineInstructions"?: boolean;
    /**
     * %vscode-docker.config.docker.machineName%
     */
    "docker.machineName"?: string;
    /**
     * %vscode-docker.config.docker.networks.description%
     */
    "docker.networks.description"?: DockerNetworksLabel[];
    /**
     * %vscode-docker.config.docker.networks.groupBy%
     */
    "docker.networks.groupBy"?: DockerNetworksGroupBy;
    /**
     * %vscode-docker.config.docker.networks.label%
     */
    "docker.networks.label"?: DockerNetworksLabel;
    /**
     * %vscode-docker.config.docker.networks.showBuiltIn%
     */
    "docker.networks.showBuiltInNetworks"?: boolean;
    /**
     * %vscode-docker.config.docker.networks.sortBy%
     */
    "docker.networks.sortBy"?: DockerSSortBy;
    /**
     * %vscode-docker.config.docker.promptForRegistryWhenPushingImages%
     */
    "docker.promptForRegistryWhenPushingImages"?: boolean;
    /**
     * %vscode-docker.config.docker.scaffolding.templatePath%
     */
    "docker.scaffolding.templatePath"?: string;
    /**
     * %vscode-docker.config.docker.showRemoteWorkspaceWarning%
     */
    "docker.showRemoteWorkspaceWarning"?: boolean;
    /**
     * %vscode-docker.config.docker.tlsVerify%
     */
    "docker.tlsVerify"?: string;
    /**
     * %vscode-docker.config.docker.truncateLongRegistryPaths%
     */
    "docker.truncateLongRegistryPaths"?: boolean;
    /**
     * %vscode-docker.config.docker.truncateMaxLength%
     */
    "docker.truncateMaxLength"?: number;
    /**
     * %vscode-docker.config.docker.volumes.description%
     */
    "docker.volumes.description"?: DockerVolumesLabel[];
    /**
     * %vscode-docker.config.docker.volumes.groupBy%
     */
    "docker.volumes.groupBy"?: DockerVolumesGroupBy;
    /**
     * %vscode-docker.config.docker.volumes.label%
     */
    "docker.volumes.label"?: DockerVolumesLabel;
    /**
     * %vscode-docker.config.docker.volumes.sortBy%
     */
    "docker.volumes.sortBy"?: DockerSSortBy;
}

export interface DockerCommandsAttachObject {
    /**
     * %vscode-docker.config.template.contextTypes.description%
     */
    contextTypes?: ContextType[];
    /**
     * %vscode-docker.config.template.attach.label%
     */
    label: string;
    /**
     * %vscode-docker.config.template.attach.match%
     */
    match?: string;
    /**
     * %vscode-docker.config.template.attach.template%
     */
    template: string;
}

type ContextType =
    "aci" |
    "moby"

export interface DockerCommandsBuildObject {
    /**
     * %vscode-docker.config.template.contextTypes.description%
     */
    contextTypes?: ContextType[];
    /**
     * %vscode-docker.config.template.build.label%
     */
    label: string;
    /**
     * %vscode-docker.config.template.build.match%
     */
    match?: string;
    /**
     * %vscode-docker.config.template.build.template%
     */
    template: string;
}

export interface DockerCommandsComposeDownObject {
    /**
     * %vscode-docker.config.template.contextTypes.description%
     */
    contextTypes?: ContextType[];
    /**
     * %vscode-docker.config.template.composeDown.label%
     */
    label: string;
    /**
     * %vscode-docker.config.template.composeDown.match%
     */
    match?: string;
    /**
     * %vscode-docker.config.template.composeDown.template%
     */
    template: string;
}

export interface DockerCommandsComposeUpObject {
    /**
     * %vscode-docker.config.template.contextTypes.description%
     */
    contextTypes?: ContextType[];
    /**
     * %vscode-docker.config.template.composeUp.label%
     */
    label: string;
    /**
     * %vscode-docker.config.template.composeUp.match%
     */
    match?: string;
    /**
     * %vscode-docker.config.template.composeUp.template%
     */
    template: string;
}

export interface DockerCommandsComposeUpSubsetObject {
    /**
     * %vscode-docker.config.template.contextTypes.description%
     */
    contextTypes?: ContextType[];
    /**
     * %vscode-docker.config.template.composeUpSubset.label%
     */
    label: string;
    /**
     * %vscode-docker.config.template.composeUpSubset.match%
     */
    match?: string;
    /**
     * %vscode-docker.config.template.composeUpSubset.template%
     */
    template: string;
}

export interface DockerCommandsLogObject {
    /**
     * %vscode-docker.config.template.contextTypes.description%
     */
    contextTypes?: ContextType[];
    /**
     * %vscode-docker.config.template.logs.label%
     */
    label: string;
    /**
     * %vscode-docker.config.template.logs.match%
     */
    match?: string;
    /**
     * %vscode-docker.config.template.logs.template%
     */
    template: string;
}

export interface DockerCommandsRunObject {
    /**
     * %vscode-docker.config.template.contextTypes.description%
     */
    contextTypes?: ContextType[];
    /**
     * %vscode-docker.config.template.run.label%
     */
    label: string;
    /**
     * %vscode-docker.config.template.run.match%
     */
    match?: string;
    /**
     * %vscode-docker.config.template.run.template%
     */
    template: string;
}

export interface DockerCommandsRunInteractiveObject {
    /**
     * %vscode-docker.config.template.contextTypes.description%
     */
    contextTypes?: ContextType[];
    /**
     * %vscode-docker.config.template.runInteractive.label%
     */
    label: string;
    /**
     * %vscode-docker.config.template.runInteractive.match%
     */
    match?: string;
    /**
     * %vscode-docker.config.template.runInteractive.template%
     */
    template: string;
}

type DockerContainersLabel =
    "Compose Project Name" |
    "ContainerId" |
    "ContainerName" |
    "CreatedTime" |
    "FullTag" |
    "ImageId" |
    "Networks" |
    "Ports" |
    "Registry" |
    "Repository" |
    "RepositoryName" |
    "RepositoryNameAndTag" |
    "State" |
    "Status" |
    "Tag"

type DockerContainersGroupBy =
    "Compose Project Name" |
    "ContainerId" |
    "ContainerName" |
    "CreatedTime" |
    "FullTag" |
    "ImageId" |
    "Networks" |
    "None" |
    "Ports" |
    "Registry" |
    "Repository" |
    "RepositoryName" |
    "RepositoryNameAndTag" |
    "State" |
    "Status" |
    "Tag"

type DockerSSortBy =
    "CreatedTime" |
    "Label"

type DockerContextsLabel =
    "Description" |
    "DockerEndpoint" |
    "Name"

type DockerImagesLabel =
    "CreatedTime" |
    "FullTag" |
    "ImageId" |
    "Registry" |
    "Repository" |
    "RepositoryName" |
    "RepositoryNameAndTag" |
    "Size" |
    "Tag"

type DockerImagesGroupBy =
    "CreatedTime" |
    "FullTag" |
    "ImageId" |
    "None" |
    "Registry" |
    "Repository" |
    "RepositoryName" |
    "RepositoryNameAndTag" |
    "Tag"

type DockerImagesSortBy =
    "CreatedTime" |
    "Label" |
    "Size"

type DockerLanguageserverDiagnostics =
    "error" |
    "ignore" |
    "warning"

type DockerNetworksLabel =
    "CreatedTime" |
    "NetworkDriver" |
    "NetworkId" |
    "NetworkName"

type DockerNetworksGroupBy =
    "CreatedTime" |
    "NetworkDriver" |
    "NetworkId" |
    "NetworkName" |
    "None"

type DockerVolumesLabel =
    "CreatedTime" |
    "VolumeName"

type DockerVolumesGroupBy =
    "CreatedTime" |
    "None" |
    "VolumeName"

export {}
