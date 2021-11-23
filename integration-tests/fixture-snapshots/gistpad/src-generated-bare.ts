export interface RegularCommands {
    "addDirectoryFile": true
    "addFile": true
    "addFileToGist": true
    "addGistComment": true
    "addRepositoryComment": true
    "addRepositoryFile": true
    "addSelectionToGist": true
    "addWikiPage": true
    "changeGistDescription": true
    "clearScratchNotes": true
    "cloneManagedRepository": true
    "cloneRepository": true
    "copyFileContents": true
    "copyFileUrl": true
    "copyGistPadUrl": true
    "copyGistUrl": true
    "copyRepositoryFileUrl": true
    "copyRepositoryUrl": true
    "deleteDirectory": true
    "deleteFile": true
    "deleteGist": true
    "deleteGistComment": true
    "deleteRepositoryBranch": true
    "deleteRepositoryComment": true
    "deleteRepositoryDirectory": true
    "deleteRepositoryFile": true
    "deleteRepository": true
    "duplicateRepositoryFile": true
    "duplicateDirectory": true
    "duplicateFile": true
    "duplicateGist": true
    "editGistComment": true
    "editRepositoryComment": true
    "openRepository": true
    "exportGistToCodePen": true
    "exportToRepo": true
    "exportTour": true
    "followUser": true
    "forkGist": true
    "hideScratchNotes": true
    "mergeRepositoryBranch": true
    "newGistLog": true
    "newSwing": true
    "newScratchNote": true
    "newSecretSwing": true
    "newPublicGist": true
    "newSecretGist": true
    "openGist": true
    "openGistFile": true
    "openGistLogFeed": true
    "openGistInBrowser": true
    "openGistInBlocks": true
    "openGistInGistLog": true
    "openGistInNbViewer": true
    "openGistWorkspace": true
    "openProfile": true
    "openRepositorySwing": true
    "openRepositoryFileInBrowser": true
    "openRepositoryInBrowser": true
    "openTodayPage": true
    "pasteGistFile": true
    "pasteImage": true
    "recordRepoCodeTour": true
    "refreshGists": true
    "refreshRepositories": true
    "refreshShowcase": true
    "renameDirectory": true
    "renameFile": true
    "renameRepositoryDirectory": true
    "renameRepositoryFile": true
    "replyGistComment": true
    "saveGistComment": true
    "saveRepositoryComment": true
    "signIn": true
    "groupGists": true
    "ungroupGists": true
    "sortGistsAlphabetically": true
    "sortGistsByUpdatedTime": true
    "starGist": true
    "starredGists": true
    "startRepoCodeTour": true
    "submitShowcaseEntry": true
    "switchRepositoryBranch": true
    "closeRepository": true
    "unfollowUser": true
    "unstarGist": true
    "uploadFileToDirectory": true
    "uploadFileToGist": true
    "uploadRepositoryFile": true
    "viewForks": true
}


export interface Configuration {
    /**
     * Specifies when to display the comment thread when you open a Gist file.
     */
    "comments.showThread"?: "always" | "never" | "whenNotEmpty";
    /**
     * Specifies the name of the directory that pasted images are uploaded to.
     */
    "images.directoryName"?: string;
    /**
     * Specifies the markup format to use when pasting an image into a markdown gist file.
     */
    "images.markdownPasteFormat"?: "html" | "markdown";
    /**
     * Specifies the upload method to use when pasting an image into a gist file.
     */
    "images.pasteType"?: "base64" | "file";
    /**
     * Specifies the moment.js format string to use when generating new scratch notes.
     */
    "scratchNotes.directoryFormat"?: string;
    /**
     * Specifies the file extension to use when generating new scratch notes.
     */
    "scratchNotes.fileExtension"?: string;
    /**
     * Specifies the moment.js format string to use when generating new scratch notes.
     */
    "scratchNotes.fileFormat"?: string;
    /**
     * Specifies whether or not to display the scratch notes node in the gists tree view.
     */
    "scratchNotes.show"?: boolean;
    /**
     * Specifies the URL of the showcase to display gists from.
     */
    showcaseUrl?: string;
    /**
     * Specifies whether to show the gist type icons in the gists tree.
     */
    treeIcons?: boolean;
    /**
     * Specifies the name of the directory that daily pages are organized within.
     */
    "wikis.daily.directoryName"?: string;
    /**
     * Specifies the date format (using Moment.js syntax) that is used to for the title of daily
     * pages.
     */
    "wikis.daily.titleFormat"?: string;
}
export {}
