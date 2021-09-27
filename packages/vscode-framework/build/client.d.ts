declare namespace NodeJS {
    interface ProcessEnv {
        /** De-facto standard. Similar to ctx.extensionMode */
        NODE_ENV: "development" | "production";
        /** `name` of package.json */
        EXTENSION_ID_NAME: string;
        /** `displayName` of package.json */
        EXTENSION_DISPLAY_NAME: string;
        /** Set to "false" to not reveal output pannel (on development only) */
        REVEAL_OUTPUT_PANEL_IN_DEVELOPMENT: string;
    }
}
