export interface RegularCommands {
    "open.docs.home": true
    "validation.current.file": true
    "validation.all.files": true
    "command.bind.grammar": true
}


export interface Configuration {
    catalogs?:                                  string[];
    "codeLens.enabled"?:                        boolean;
    "completion.autoCloseRemovesContent"?:      boolean;
    "completion.autoCloseTags"?:                boolean;
    "extension.jars"?:                          any[];
    fileAssociations?:                          FileAssociation[];
    "format.closingBracketNewLine"?:            boolean;
    "format.emptyElements"?:                    "collapse" | "expand" | "ignore";
    "format.enabled"?:                          boolean;
    "format.enforceQuoteStyle"?:                "ignore" | "preferred";
    "format.joinCDATALines"?:                   boolean;
    "format.joinCommentLines"?:                 boolean;
    "format.joinContentLines"?:                 boolean;
    "format.preserveAttributeLineBreaks"?:      boolean;
    "format.preservedNewlines"?:                number;
    "format.preserveEmptyContent"?:             boolean;
    "format.spaceBeforeEmptyCloseTag"?:         boolean;
    "format.splitAttributes"?:                  boolean;
    "format.splitAttributesIndentSize"?:        number;
    "format.xsiSchemaLocationSplit"?:           "none" | "onElement" | "onPair";
    "java.home"?:                               null | string;
    "logs.client"?:                             boolean;
    "preferences.quoteStyle"?:                  "double" | "single";
    "preferences.showSchemaDocumentationType"?: "all" | "appinfo" | "documentation" | "none";
    "server.binary.args"?:                      string;
    /**
     * Specify the path of a custom binary version of the XML server to use. A binary will be
     * downloaded if this is not set.
     */
    "server.binary.path"?:          string;
    "server.binary.trustedHashes"?: string[];
    /**
     * By default, vscode-xml tries to run the Java version of the XML Language Server. If no
     * Java is detected, vscode-xml runs the binary XML language server. When this setting is
     * enabled, the binary will also be used even if Java is installed. If there are additions
     * to the XML Language Server provided by other extensions, Java will be used (if available)
     * even if this setting is enabled.
     */
    "server.preferBinary"?: boolean;
    /**
     * The XML Language server allows other VSCode extensions to extend its functionality. It
     * requires Java-specific features in order to do this. If extensions to the XML language
     * server are detected, but a binary XML language server is run, a warning will appear. This
     * setting can be used to disable this warning.
     */
    "server.silenceExtensionWarning"?:     boolean;
    "server.vmargs"?:                      null | string;
    "server.workDir"?:                     string;
    "symbols.enabled"?:                    boolean;
    "symbols.excluded"?:                   string[];
    "symbols.filters"?:                    SymbolsFilter[];
    "symbols.maxItemsComputed"?:           number;
    "symbols.showReferencedGrammars"?:     boolean;
    "telemetry.enabled"?:                  boolean;
    "trace.server"?:                       "messages" | "off" | "verbose";
    "validation.disallowDocTypeDecl"?:     boolean;
    "validation.enabled"?:                 boolean;
    "validation.namespaces.enabled"?:      "always" | "never" | "onNamespaceEncountered";
    "validation.noGrammar"?:               "error" | "hint" | "ignore" | "info" | "warning";
    "validation.resolveExternalEntities"?: boolean;
    "validation.schema.enabled"?:          "always" | "never" | "onValidSchema";
}

export interface FileAssociation {
    pattern: string;
    /**
     * The path or URL to the XML schema (XSD or DTD).
     */
    systemId: string;
}export interface SymbolsFilter {
    expressions: Expression[];
    pattern:     string;
}

/**
 * The XML symbol expression.
 */
export interface Expression {
    /**
     * Exclude/Include the node which matches the XPath expression .
     */
    excluded?: boolean;
    xpath?:    string;
}
export {}
