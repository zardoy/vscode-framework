declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: "development" | "production";
        EXTENSION_NAME: string;
    }
}