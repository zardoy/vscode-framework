declare module 'vscode-framework' {
    interface RegularCommands {
    }
    interface Settings extends Required<ConfigurationObject> {}
}

interface ConfigurationObject {
    "redhat.telemetry.enabled"?: boolean;
    /**
     * Enable/disable completion feature
     */
    "yaml.completion"?: boolean;
    /**
     * Custom tags for the parser to use
     */
    "yaml.customTags"?: any[];
    /**
     * Globally set additionalProperties to false for all objects. So if its true, no extra
     * properties are allowed inside yaml.
     */
    "yaml.disableAdditionalProperties"?: boolean;
    /**
     * Print spaces between brackets in objects
     */
    "yaml.format.bracketSpacing"?: boolean;
    /**
     * Enable/disable default YAML formatter
     */
    "yaml.format.enable"?: boolean;
    /**
     * Specify the line length that the printer will wrap on
     */
    "yaml.format.printWidth"?: number;
    /**
     * Always: wrap prose if it exeeds the print width, Never: never wrap the prose, Preserve:
     * wrap prose as-is
     */
    "yaml.format.proseWrap"?: YAMLFormatProseWrap;
    /**
     * Use single quotes instead of double quotes
     */
    "yaml.format.singleQuote"?: boolean;
    /**
     * Enable/disable hover feature
     */
    "yaml.hover"?: boolean;
    /**
     * The maximum number of outline symbols and folding regions computed (limited for
     * performance reasons).
     */
    "yaml.maxItemsComputed"?: number;
    /**
     * Associate schemas to YAML files in the current workspace
     */
    "yaml.schemas"?: { [key: string]: any };
    /**
     * Automatically pull available YAML schemas from JSON Schema Store
     */
    "yaml.schemaStore.enable"?: boolean;
    /**
     * URL of schema store catalog to use
     */
    "yaml.schemaStore.url"?: string;
    /**
     * Traces the communication between VSCode and the YAML language service.
     */
    "yaml.trace.server"?: YAMLTraceServer;
    /**
     * Enable/disable validation feature
     */
    "yaml.validate"?:    boolean;
    "yaml.yamlVersion"?: YAMLYAMLVersion;
}

type YAMLFormatProseWrap =
    "always" |
    "never" |
    "preserve"

type YAMLTraceServer =
    "messages" |
    "off" |
    "verbose"

type YAMLYAMLVersion =
    "1.1" |
    "1.2"

export {}
