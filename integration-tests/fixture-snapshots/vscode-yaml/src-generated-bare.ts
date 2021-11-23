export interface RegularCommands {
}


export interface Configuration {
    /**
     * Enable/disable completion feature
     */
    completion?: boolean;
    /**
     * Custom tags for the parser to use
     */
    customTags?: any[];
    /**
     * Globally set additionalProperties to false for all objects. So if its true, no extra
     * properties are allowed inside yaml.
     */
    disableAdditionalProperties?: boolean;
    /**
     * Print spaces between brackets in objects
     */
    "format.bracketSpacing"?: boolean;
    /**
     * Enable/disable default YAML formatter
     */
    "format.enable"?: boolean;
    /**
     * Specify the line length that the printer will wrap on
     */
    "format.printWidth"?: number;
    /**
     * Always: wrap prose if it exeeds the print width, Never: never wrap the prose, Preserve:
     * wrap prose as-is
     */
    "format.proseWrap"?: "always" | "never" | "preserve";
    /**
     * Use single quotes instead of double quotes
     */
    "format.singleQuote"?: boolean;
    /**
     * Enable/disable hover feature
     */
    hover?: boolean;
    /**
     * The maximum number of outline symbols and folding regions computed (limited for
     * performance reasons).
     */
    maxItemsComputed?: number;
    /**
     * Associate schemas to YAML files in the current workspace
     */
    schemas?: { [key: string]: any };
    /**
     * Automatically pull available YAML schemas from JSON Schema Store
     */
    "schemaStore.enable"?: boolean;
    /**
     * URL of schema store catalog to use
     */
    "schemaStore.url"?:   string;
    "telemetry.enabled"?: boolean;
    /**
     * Traces the communication between VSCode and the YAML language service.
     */
    "trace.server"?: "messages" | "off" | "verbose";
    /**
     * Enable/disable validation feature
     */
    validate?:    boolean;
    yamlVersion?: "1.1" | "1.2";
}
export {}
