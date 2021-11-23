export interface RegularCommands {
    "setLogLevel": true
    "clone": true
    "cloneRecursive": true
    "init": true
    "openRepository": true
    "close": true
    "refresh": true
    "openChange": true
    "openAllChanges": true
    "openFile": true
    "openFile2": true
    "openHEADFile": true
    "stage": true
    "stageAll": true
    "stageAllTracked": true
    "stageAllUntracked": true
    "stageAllMerge": true
    "stageSelectedRanges": true
    "revertSelectedRanges": true
    "stageChange": true
    "revertChange": true
    "unstage": true
    "unstageAll": true
    "unstageSelectedRanges": true
    "clean": true
    "cleanAll": true
    "cleanAllTracked": true
    "cleanAllUntracked": true
    "rename": true
    "commit": true
    "commitStaged": true
    "commitEmpty": true
    "commitStagedSigned": true
    "commitStagedAmend": true
    "commitAll": true
    "commitAllSigned": true
    "commitAllAmend": true
    "commitNoVerify": true
    "commitStagedNoVerify": true
    "commitEmptyNoVerify": true
    "commitStagedSignedNoVerify": true
    "commitStagedAmendNoVerify": true
    "commitAllNoVerify": true
    "commitAllSignedNoVerify": true
    "commitAllAmendNoVerify": true
    "restoreCommitTemplate": true
    "undoCommit": true
    "checkout": true
    "checkoutDetached": true
    "branch": true
    "branchFrom": true
    "deleteBranch": true
    "renameBranch": true
    "merge": true
    "rebase": true
    "createTag": true
    "deleteTag": true
    "fetch": true
    "fetchPrune": true
    "fetchAll": true
    "pull": true
    "pullRebase": true
    "pullFrom": true
    "push": true
    "pushForce": true
    "pushTo": true
    "pushToForce": true
    "pushTags": true
    "pushWithTags": true
    "pushWithTagsForce": true
    "cherryPick": true
    "addRemote": true
    "removeRemote": true
    "sync": true
    "syncRebase": true
    "publish": true
    "showOutput": true
    "ignore": true
    "revealInExplorer": true
    "stashIncludeUntracked": true
    "stash": true
    "stashPop": true
    "stashPopLatest": true
    "stashApply": true
    "stashApplyLatest": true
    "stashDrop": true
    "timeline.openDiff": true
    "timeline.copyCommitId": true
    "timeline.copyCommitMessage": true
    "timeline.selectForCompare": true
    "timeline.compareWithSelected": true
    "rebaseAbort": true
    "api.getRepositories": true
    "api.getRepositoryState": true
    "api.getRemoteSources": true
}


export interface Configuration {
    /**
     * %config.allowForcePush%
     */
    allowForcePush?: boolean;
    /**
     * %config.allowNoVerifyCommit%
     */
    allowNoVerifyCommit?: boolean;
    /**
     * %config.alwaysShowStagedChangesResourceGroup%
     */
    alwaysShowStagedChangesResourceGroup?: boolean;
    /**
     * %config.alwaysSignOff%
     */
    alwaysSignOff?:   boolean;
    autofetch?:       boolean | "all";
    autofetchPeriod?: number;
    /**
     * %config.autorefresh%
     */
    autorefresh?: boolean;
    /**
     * %config.autoRepositoryDetection%
     */
    autoRepositoryDetection?: boolean | "openEditors" | "subFolders";
    /**
     * %config.autoStash%
     */
    autoStash?: boolean;
    /**
     * %config.branchSortOrder%
     */
    branchSortOrder?: "alphabetically" | "committerdate";
    /**
     * %config.branchValidationRegex%
     */
    branchValidationRegex?: string;
    /**
     * %config.branchWhitespaceChar%
     */
    branchWhitespaceChar?: string;
    checkoutType?:         "local" | "remote" | "tags"[];
    /**
     * %config.confirmEmptyCommits%
     */
    confirmEmptyCommits?: boolean;
    /**
     * %config.confirmForcePush%
     */
    confirmForcePush?: boolean;
    /**
     * %config.confirmNoVerifyCommit%
     */
    confirmNoVerifyCommit?: boolean;
    /**
     * %config.confirmSync%
     */
    confirmSync?: boolean;
    /**
     * %config.countBadge%
     */
    countBadge?: "all" | "off" | "tracked";
    /**
     * %config.decorations.enabled%
     */
    "decorations.enabled"?: boolean;
    /**
     * %config.defaultCloneDirectory%
     */
    defaultCloneDirectory?: null | string;
    /**
     * %config.detectSubmodules%
     */
    detectSubmodules?: boolean;
    /**
     * %config.detectSubmodulesLimit%
     */
    detectSubmodulesLimit?: number;
    /**
     * %config.enableCommitSigning%
     */
    enableCommitSigning?: boolean;
    /**
     * %config.enabled%
     */
    enabled?: boolean;
    /**
     * %config.enableSmartCommit%
     */
    enableSmartCommit?: boolean;
    /**
     * %config.enableStatusBarSync%
     */
    enableStatusBarSync?: boolean;
    /**
     * %config.fetchOnPull%
     */
    fetchOnPull?: boolean;
    /**
     * %config.followTagsWhenSync%
     */
    followTagsWhenSync?:   boolean;
    githubAuthentication?: any;
    /**
     * %config.ignoredRepositories%
     */
    ignoredRepositories?: string[];
    /**
     * %config.ignoreLegacyWarning%
     */
    ignoreLegacyWarning?: boolean;
    /**
     * %config.ignoreLimitWarning%
     */
    ignoreLimitWarning?: boolean;
    /**
     * %config.ignoreMissingGitWarning%
     */
    ignoreMissingGitWarning?: boolean;
    /**
     * %config.ignoreRebaseWarning%
     */
    ignoreRebaseWarning?: boolean;
    /**
     * %config.ignoreSubmodules%
     */
    ignoreSubmodules?: boolean;
    /**
     * %config.ignoreWindowsGit27Warning%
     */
    ignoreWindowsGit27Warning?: boolean;
    /**
     * %config.inputValidation%
     */
    inputValidation?: "always" | "off" | "warn";
    /**
     * %config.inputValidationLength%
     */
    inputValidationLength?: number;
    /**
     * %config.inputValidationSubjectLength%
     */
    inputValidationSubjectLength?: number | null;
    /**
     * %config.openAfterClone%
     */
    openAfterClone?: "always" | "alwaysNewWindow" | "prompt" | "whenNoFolderOpen";
    /**
     * %config.openDiffOnClick%
     */
    openDiffOnClick?:   boolean;
    path?:              any[] | null | string;
    postCommitCommand?: "none" | "push" | "sync";
    /**
     * %config.promptToSaveFilesBeforeCommit%
     */
    promptToSaveFilesBeforeCommit?: "always" | "never" | "staged";
    /**
     * %config.promptToSaveFilesBeforeStash%
     */
    promptToSaveFilesBeforeStash?: "always" | "never" | "staged";
    /**
     * %config.pruneOnFetch%
     */
    pruneOnFetch?: boolean;
    /**
     * %config.pullTags%
     */
    pullTags?: boolean;
    /**
     * %config.rebaseWhenSync%
     */
    rebaseWhenSync?: boolean;
    /**
     * %config.requireGitUserConfig%
     */
    requireGitUserConfig?: boolean;
    /**
     * %config.scanRepositories%
     */
    scanRepositories?: string[];
    /**
     * %config.showCommitInput%
     */
    showCommitInput?: boolean;
    /**
     * %config.showInlineOpenFileAction%
     */
    showInlineOpenFileAction?: boolean;
    /**
     * %config.showProgress%
     */
    showProgress?: boolean;
    /**
     * %config.showPushSuccessNotification%
     */
    showPushSuccessNotification?: boolean;
    /**
     * %config.showUnpublishedCommitsButton%
     */
    showUnpublishedCommitsButton?: "always" | "never" | "whenEmpty";
    /**
     * %config.smartCommitChanges%
     */
    smartCommitChanges?: "all" | "tracked";
    /**
     * %config.statusLimit%
     */
    statusLimit?: number;
    /**
     * %config.suggestSmartCommit%
     */
    suggestSmartCommit?: boolean;
    /**
     * %config.supportCancellation%
     */
    supportCancellation?: boolean;
    /**
     * %config.terminalAuthentication%
     */
    terminalAuthentication?: boolean;
    /**
     * %config.timeline.date%
     */
    "timeline.date"?: "authored" | "committed";
    /**
     * %config.timeline.showAuthor%
     */
    "timeline.showAuthor"?: boolean;
    /**
     * %config.untrackedChanges%
     */
    untrackedChanges?: "hidden" | "mixed" | "separate";
    /**
     * %config.useCommitInputAsStashMessage%
     */
    useCommitInputAsStashMessage?: boolean;
    /**
     * %config.useForcePushWithLease%
     */
    useForcePushWithLease?: boolean;
}
export {}
