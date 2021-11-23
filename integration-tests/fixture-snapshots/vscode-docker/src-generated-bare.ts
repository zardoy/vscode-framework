export interface RegularCommands {
    "compose.down": true
    "compose.restart": true
    "compose.up": true
    "compose.up.subset": true
    "configure": true
    "configureCompose": true
    "installDocker": true
    "containers.attachShell": true
    "containers.browse": true
    "containers.configureExplorer": true
    "containers.downloadFile": true
    "containers.inspect": true
    "containers.openFile": true
    "containers.prune": true
    "containers.refresh": true
    "containers.remove": true
    "containers.restart": true
    "containers.select": true
    "containers.start": true
    "containers.stop": true
    "containers.stats": true
    "containers.viewLogs": true
    "containers.composeGroup.logs": true
    "containers.composeGroup.start": true
    "containers.composeGroup.stop": true
    "containers.composeGroup.restart": true
    "containers.composeGroup.down": true
    "debugging.initializeForDebugging": true
    "images.build": true
    "images.configureExplorer": true
    "images.inspect": true
    "images.prune": true
    "images.showDangling": true
    "images.pull": true
    "images.push": true
    "images.refresh": true
    "images.remove": true
    "images.run": true
    "images.runAzureCli": true
    "images.runInteractive": true
    "images.tag": true
    "images.copyFullTag": true
    "networks.configureExplorer": true
    "networks.create": true
    "networks.inspect": true
    "networks.prune": true
    "networks.refresh": true
    "networks.remove": true
    "pruneSystem": true
    "registries.azure.buildImage": true
    "registries.azure.createRegistry": true
    "registries.azure.deleteRegistry": true
    "registries.azure.deleteRepository": true
    "registries.azure.openInPortal": true
    "registries.azure.runFileAsTask": true
    "registries.azure.runTask": true
    "registries.azure.selectSubscriptions": true
    "registries.azure.untagImage": true
    "registries.azure.viewProperties": true
    "registries.azure.viewTaskLogs": true
    "registries.connectRegistry": true
    "registries.copyImageDigest": true
    "registries.deleteImage": true
    "registries.deployImageToAzure": true
    "registries.deployImageToAci": true
    "registries.disconnectRegistry": true
    "registries.dockerHub.openInBrowser": true
    "registries.help": true
    "registries.logInToDockerCli": true
    "registries.logOutOfDockerCli": true
    "registries.pullImage": true
    "registries.pullRepository": true
    "registries.reconnectRegistry": true
    "registries.refresh": true
    "volumes.configureExplorer": true
    "volumes.inspect": true
    "volumes.prune": true
    "volumes.refresh": true
    "volumes.remove": true
    "help": true
    "help.reportIssue": true
    "help.openWalkthrough": true
    "contexts.use": true
    "contexts.remove": true
    "contexts.inspect": true
    "contexts.configureExplorer": true
    "contexts.refresh": true
    "contexts.help": true
    "contexts.create.aci": true
}


export interface Configuration {
    /**
     * %vscode-docker.config.docker.certPath%
     */
    certPath?: string;
    /**
     * %vscode-docker.config.template.attach.description%
     */
    "commands.attach"?: Array<any[] | boolean | number | number | null | CommandsAttachObject | string> | string;
    /**
     * %vscode-docker.config.template.build.description%
     */
    "commands.build"?: Array<any[] | boolean | number | number | null | CommandsBuildObject | string> | string;
    /**
     * %vscode-docker.config.template.composeDown.description%
     */
    "commands.composeDown"?: Array<any[] | boolean | number | number | null | CommandsComposeDownObject | string> | string;
    /**
     * %vscode-docker.config.template.composeUp.description%
     */
    "commands.composeUp"?: Array<any[] | boolean | number | number | null | CommandsComposeUpObject | string> | string;
    /**
     * %vscode-docker.config.template.composeUpSubset.description%
     */
    "commands.composeUpSubset"?: Array<any[] | boolean | number | number | null | CommandsComposeUpSubsetObject | string> | string;
    /**
     * %vscode-docker.config.template.logs.description%
     */
    "commands.logs"?: Array<any[] | boolean | number | number | null | CommandsLogObject | string> | string;
    /**
     * %vscode-docker.config.template.run.description%
     */
    "commands.run"?: Array<any[] | boolean | number | number | null | CommandsRunObject | string> | string;
    /**
     * %vscode-docker.config.template.runInteractive.description%
     */
    "commands.runInteractive"?: Array<any[] | boolean | number | number | null | CommandsRunInteractiveObject | string> | string;
    /**
     * %vscode-docker.config.docker.containers.description%
     */
    "containers.description"?: "Compose Project Name" | "ContainerId" | "ContainerName" | "CreatedTime" | "FullTag" | "ImageId" | "Networks" | "Ports" | "Registry" | "Repository" | "RepositoryName" | "RepositoryNameAndTag" | "State" | "Status" | "Tag"[];
    /**
     * %vscode-docker.config.docker.containers.groupBy%
     */
    "containers.groupBy"?: "Compose Project Name" | "ContainerId" | "ContainerName" | "CreatedTime" | "FullTag" | "ImageId" | "Networks" | "None" | "Ports" | "Registry" | "Repository" | "RepositoryName" | "RepositoryNameAndTag" | "State" | "Status" | "Tag";
    /**
     * %vscode-docker.config.docker.containers.label%
     */
    "containers.label"?: "Compose Project Name" | "ContainerId" | "ContainerName" | "CreatedTime" | "FullTag" | "ImageId" | "Networks" | "Ports" | "Registry" | "Repository" | "RepositoryName" | "RepositoryNameAndTag" | "State" | "Status" | "Tag";
    /**
     * %vscode-docker.config.docker.containers.sortBy%
     */
    "containers.sortBy"?: "CreatedTime" | "Label";
    /**
     * %vscode-docker.config.docker.context%
     */
    context?: string;
    /**
     * %vscode-docker.config.docker.contexts.description%
     */
    "contexts.description"?: "Description" | "DockerEndpoint" | "Name"[];
    /**
     * %vscode-docker.config.docker.contexts.label%
     */
    "contexts.label"?: "Description" | "DockerEndpoint" | "Name";
    /**
     * %vscode-docker.config.docker.dockerComposeBuild%
     */
    dockerComposeBuild?: boolean;
    /**
     * %vscode-docker.config.docker.dockerComposeDetached%
     */
    dockerComposeDetached?: boolean;
    /**
     * %vscode-docker.config.docker.dockerodeOptions%
     */
    dockerodeOptions?: { [key: string]: any };
    /**
     * %vscode-docker.config.docker.dockerPath%
     */
    dockerPath?: string;
    /**
     * %vscode-docker.config.docker.enableDockerComposeLanguageService%
     */
    enableDockerComposeLanguageService?: boolean;
    /**
     * %vscode-docker.config.docker.explorerRefreshInterval%
     */
    explorerRefreshInterval?: number;
    /**
     * %vscode-docker.config.docker.host%
     */
    host?: string;
    /**
     * %vscode-docker.config.docker.imageBuildContextPath%
     */
    imageBuildContextPath?: string;
    /**
     * %vscode-docker.config.docker.images.checkForOutdatedImages%
     */
    "images.checkForOutdatedImages"?: boolean;
    /**
     * %vscode-docker.config.docker.images.description%
     */
    "images.description"?: "CreatedTime" | "FullTag" | "ImageId" | "Registry" | "Repository" | "RepositoryName" | "RepositoryNameAndTag" | "Size" | "Tag"[];
    /**
     * %vscode-docker.config.docker.images.groupBy%
     */
    "images.groupBy"?: "CreatedTime" | "FullTag" | "ImageId" | "None" | "Registry" | "Repository" | "RepositoryName" | "RepositoryNameAndTag" | "Tag";
    /**
     * %vscode-docker.config.docker.images.label%
     */
    "images.label"?: "CreatedTime" | "FullTag" | "ImageId" | "Registry" | "Repository" | "RepositoryName" | "RepositoryNameAndTag" | "Size" | "Tag";
    /**
     * %vscode-docker.config.docker.images.sortBy%
     */
    "images.sortBy"?: "CreatedTime" | "Label" | "Size";
    /**
     * %vscode-docker.config.docker.languageserver.diagnostics.deprecatedMaintainer%
     */
    "languageserver.diagnostics.deprecatedMaintainer"?: "error" | "ignore" | "warning";
    /**
     * %vscode-docker.config.docker.languageserver.diagnostics.directiveCasing%
     */
    "languageserver.diagnostics.directiveCasing"?: "error" | "ignore" | "warning";
    /**
     * %vscode-docker.config.docker.languageserver.diagnostics.emptyContinuationLine%
     */
    "languageserver.diagnostics.emptyContinuationLine"?: "error" | "ignore" | "warning";
    /**
     * %vscode-docker.config.docker.languageserver.diagnostics.instructionCasing%
     */
    "languageserver.diagnostics.instructionCasing"?: "error" | "ignore" | "warning";
    /**
     * %vscode-docker.config.docker.languageserver.diagnostics.instructionCmdMultiple%
     */
    "languageserver.diagnostics.instructionCmdMultiple"?: "error" | "ignore" | "warning";
    /**
     * %vscode-docker.config.docker.languageserver.diagnostics.instructionEntrypointMultiple%
     */
    "languageserver.diagnostics.instructionEntrypointMultiple"?: "error" | "ignore" | "warning";
    /**
     * %vscode-docker.config.docker.languageserver.diagnostics.instructionHealthcheckMultiple%
     */
    "languageserver.diagnostics.instructionHealthcheckMultiple"?: "error" | "ignore" | "warning";
    /**
     * %vscode-docker.config.docker.languageserver.diagnostics.instructionJsonInSingleQuotes%
     */
    "languageserver.diagnostics.instructionJSONInSingleQuotes"?: "error" | "ignore" | "warning";
    /**
     * %vscode-docker.config.docker.languageserver.diagnostics.instructionWorkdirRelative%
     */
    "languageserver.diagnostics.instructionWorkdirRelative"?: "error" | "ignore" | "warning";
    /**
     * %vscode-docker.config.docker.languageserver.formatter.ignoreMultilineInstructions%
     */
    "languageserver.formatter.ignoreMultilineInstructions"?: boolean;
    /**
     * %vscode-docker.config.docker.machineName%
     */
    machineName?: string;
    /**
     * %vscode-docker.config.docker.networks.description%
     */
    "networks.description"?: "CreatedTime" | "NetworkDriver" | "NetworkId" | "NetworkName"[];
    /**
     * %vscode-docker.config.docker.networks.groupBy%
     */
    "networks.groupBy"?: "CreatedTime" | "NetworkDriver" | "NetworkId" | "NetworkName" | "None";
    /**
     * %vscode-docker.config.docker.networks.label%
     */
    "networks.label"?: "CreatedTime" | "NetworkDriver" | "NetworkId" | "NetworkName";
    /**
     * %vscode-docker.config.docker.networks.showBuiltIn%
     */
    "networks.showBuiltInNetworks"?: boolean;
    /**
     * %vscode-docker.config.docker.networks.sortBy%
     */
    "networks.sortBy"?: "CreatedTime" | "Label";
    /**
     * %vscode-docker.config.docker.promptForRegistryWhenPushingImages%
     */
    promptForRegistryWhenPushingImages?: boolean;
    /**
     * %vscode-docker.config.docker.scaffolding.templatePath%
     */
    "scaffolding.templatePath"?: string;
    /**
     * %vscode-docker.config.docker.showRemoteWorkspaceWarning%
     */
    showRemoteWorkspaceWarning?: boolean;
    /**
     * %vscode-docker.config.docker.tlsVerify%
     */
    tlsVerify?: string;
    /**
     * %vscode-docker.config.docker.truncateLongRegistryPaths%
     */
    truncateLongRegistryPaths?: boolean;
    /**
     * %vscode-docker.config.docker.truncateMaxLength%
     */
    truncateMaxLength?: number;
    /**
     * %vscode-docker.config.docker.volumes.description%
     */
    "volumes.description"?: "CreatedTime" | "VolumeName"[];
    /**
     * %vscode-docker.config.docker.volumes.groupBy%
     */
    "volumes.groupBy"?: "CreatedTime" | "None" | "VolumeName";
    /**
     * %vscode-docker.config.docker.volumes.label%
     */
    "volumes.label"?: "CreatedTime" | "VolumeName";
    /**
     * %vscode-docker.config.docker.volumes.sortBy%
     */
    "volumes.sortBy"?: "CreatedTime" | "Label";
}

export interface CommandsAttachObject {
    /**
     * %vscode-docker.config.template.contextTypes.description%
     */
    contextTypes?: "aci" | "moby"[];
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
export interface CommandsBuildObject {
    /**
     * %vscode-docker.config.template.contextTypes.description%
     */
    contextTypes?: "aci" | "moby"[];
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

export interface CommandsComposeDownObject {
    /**
     * %vscode-docker.config.template.contextTypes.description%
     */
    contextTypes?: "aci" | "moby"[];
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

export interface CommandsComposeUpObject {
    /**
     * %vscode-docker.config.template.contextTypes.description%
     */
    contextTypes?: "aci" | "moby"[];
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

export interface CommandsComposeUpSubsetObject {
    /**
     * %vscode-docker.config.template.contextTypes.description%
     */
    contextTypes?: "aci" | "moby"[];
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

export interface CommandsLogObject {
    /**
     * %vscode-docker.config.template.contextTypes.description%
     */
    contextTypes?: "aci" | "moby"[];
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

export interface CommandsRunObject {
    /**
     * %vscode-docker.config.template.contextTypes.description%
     */
    contextTypes?: "aci" | "moby"[];
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

export interface CommandsRunInteractiveObject {
    /**
     * %vscode-docker.config.template.contextTypes.description%
     */
    contextTypes?: "aci" | "moby"[];
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
export {}
