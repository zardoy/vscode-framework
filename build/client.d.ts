declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: "development" | "production";
        EXTENSION_ID_NAME: string;
        EXTENSION_DISPLAY_NAME: string;
        REVEAL_OUTPUT_PANEL_IN_DEVELOPMENT: string;
    }
}
