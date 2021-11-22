declare module 'vscode-framework' {
    interface RegularCommands {
        "gistpad.addDirectoryFile": true
        "gistpad.addFile": true
        "gistpad.addFileToGist": true
        "gistpad.addGistComment": true
        "gistpad.addRepositoryComment": true
        "gistpad.addRepositoryFile": true
        "gistpad.addSelectionToGist": true
        "gistpad.addWikiPage": true
        "gistpad.changeGistDescription": true
        "gistpad.clearScratchNotes": true
        "gistpad.cloneManagedRepository": true
        "gistpad.cloneRepository": true
        "gistpad.copyFileContents": true
        "gistpad.copyFileUrl": true
        "gistpad.copyGistPadUrl": true
        "gistpad.copyGistUrl": true
        "gistpad.copyRepositoryFileUrl": true
        "gistpad.copyRepositoryUrl": true
        "gistpad.deleteDirectory": true
        "gistpad.deleteFile": true
        "gistpad.deleteGist": true
        "gistpad.deleteGistComment": true
        "gistpad.deleteRepositoryBranch": true
        "gistpad.deleteRepositoryComment": true
        "gistpad.deleteRepositoryDirectory": true
        "gistpad.deleteRepositoryFile": true
        "gistpad.deleteRepository": true
        "gistpad.duplicateRepositoryFile": true
        "gistpad.duplicateDirectory": true
        "gistpad.duplicateFile": true
        "gistpad.duplicateGist": true
        "gistpad.editGistComment": true
        "gistpad.editRepositoryComment": true
        "gistpad.openRepository": true
        "gistpad.exportGistToCodePen": true
        "gistpad.exportToRepo": true
        "gistpad.exportTour": true
        "gistpad.followUser": true
        "gistpad.forkGist": true
        "gistpad.hideScratchNotes": true
        "gistpad.mergeRepositoryBranch": true
        "gistpad.newGistLog": true
        "gistpad.newSwing": true
        "gistpad.newScratchNote": true
        "gistpad.newSecretSwing": true
        "gistpad.newPublicGist": true
        "gistpad.newSecretGist": true
        "gistpad.openGist": true
        "gistpad.openGistFile": true
        "gistpad.openGistLogFeed": true
        "gistpad.openGistInBrowser": true
        "gistpad.openGistInBlocks": true
        "gistpad.openGistInGistLog": true
        "gistpad.openGistInNbViewer": true
        "gistpad.openGistWorkspace": true
        "gistpad.openProfile": true
        "gistpad.openRepositorySwing": true
        "gistpad.openRepositoryFileInBrowser": true
        "gistpad.openRepositoryInBrowser": true
        "gistpad.openTodayPage": true
        "gistpad.pasteGistFile": true
        "gistpad.pasteImage": true
        "gistpad.recordRepoCodeTour": true
        "gistpad.refreshGists": true
        "gistpad.refreshRepositories": true
        "gistpad.refreshShowcase": true
        "gistpad.renameDirectory": true
        "gistpad.renameFile": true
        "gistpad.renameRepositoryDirectory": true
        "gistpad.renameRepositoryFile": true
        "gistpad.replyGistComment": true
        "gistpad.saveGistComment": true
        "gistpad.saveRepositoryComment": true
        "gistpad.signIn": true
        "gistpad.groupGists": true
        "gistpad.ungroupGists": true
        "gistpad.sortGistsAlphabetically": true
        "gistpad.sortGistsByUpdatedTime": true
        "gistpad.starGist": true
        "gistpad.starredGists": true
        "gistpad.startRepoCodeTour": true
        "gistpad.submitShowcaseEntry": true
        "gistpad.switchRepositoryBranch": true
        "gistpad.closeRepository": true
        "gistpad.unfollowUser": true
        "gistpad.unstarGist": true
        "gistpad.uploadFileToDirectory": true
        "gistpad.uploadFileToGist": true
        "gistpad.uploadRepositoryFile": true
        "gistpad.viewForks": true
    }
    interface Settings extends Required<ConfigurationObject> {}
}

interface ConfigurationObject {
    /**
     * Specifies when to display the comment thread when you open a Gist file.
     */
    "gistpad.comments.showThread"?: GistpadCommentsShowThread;
    /**
     * Specifies the name of the directory that pasted images are uploaded to.
     */
    "gistpad.images.directoryName"?: string;
    /**
     * Specifies the markup format to use when pasting an image into a markdown gist file.
     */
    "gistpad.images.markdownPasteFormat"?: GistpadImagesMarkdownPasteFormat;
    /**
     * Specifies the upload method to use when pasting an image into a gist file.
     */
    "gistpad.images.pasteType"?: GistpadImagesPasteType;
    /**
     * Specifies the moment.js format string to use when generating new scratch notes.
     */
    "gistpad.scratchNotes.directoryFormat"?: string;
    /**
     * Specifies the file extension to use when generating new scratch notes.
     */
    "gistpad.scratchNotes.fileExtension"?: string;
    /**
     * Specifies the moment.js format string to use when generating new scratch notes.
     */
    "gistpad.scratchNotes.fileFormat"?: string;
    /**
     * Specifies whether or not to display the scratch notes node in the gists tree view.
     */
    "gistpad.scratchNotes.show"?: boolean;
    /**
     * Specifies the URL of the showcase to display gists from.
     */
    "gistpad.showcaseUrl"?: string;
    /**
     * Specifies whether to show the gist type icons in the gists tree.
     */
    "gistpad.treeIcons"?: boolean;
    /**
     * Specifies the name of the directory that daily pages are organized within.
     */
    "gistpad.wikis.daily.directoryName"?: string;
    /**
     * Specifies the date format (using Moment.js syntax) that is used to for the title of daily
     * pages.
     */
    "gistpad.wikis.daily.titleFormat"?: string;
}

type GistpadCommentsShowThread =
    "always" |
    "never" |
    "whenNotEmpty"

type GistpadImagesMarkdownPasteFormat =
    "html" |
    "markdown"

type GistpadImagesPasteType =
    "base64" |
    "file"

export {}
