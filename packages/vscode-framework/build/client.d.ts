declare namespace NodeJS {
    interface ProcessEnv {
        /** Use this instead of `ctx.extensionMode` */
        NODE_ENV: 'development' | 'production' | 'test'
        /** `name` of package.json */
        EXTENSION_ID_NAME: string
        /** `displayName` of package.json */
        EXTENSION_DISPLAY_NAME: string
        /** Set to "false" to not reveal output pannel (in development only) */
        REVEAL_OUTPUT_PANEL_IN_DEVELOPMENT: string
        /** Prefix of IDs for contributions (commands / configuration). Defined only when isn't disabled in config */
        IDS_PREFIX?: string
        /**
         * Use this instead of `vscode.env.appHost`
         *  */
        PLATFORM: 'node' | 'web'
    }
}

interface Console {
    /** Added by `vscode-framework`. Available only when `config.console` == 'outputChannel' (by default).
     *
     * Reveal outputChannel with logs
     * @param preserveFocus false by default. set to true to not focus on output
     *  */
    show(preserveFocus?: boolean): void
    /** Added by `vscode-framework`. Available only when `config.console` == 'outputChannel' (by default).
     *
     * Hide outputChannel with logs */
    hide(): void
}
