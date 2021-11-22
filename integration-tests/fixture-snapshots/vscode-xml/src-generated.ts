declare module 'vscode-framework' {
    interface RegularCommands {
        "xml.open.docs.home": true
        "xml.validation.current.file": true
        "xml.validation.all.files": true
        "xml.command.bind.grammar": true
    }
    interface Settings extends Required<ConfigurationObject> {}
}

interface ConfigurationObject {
    "redhat.telemetry.enabled"?:                    boolean;
    "xml.catalogs"?:                                string[];
    "xml.codeLens.enabled"?:                        boolean;
    "xml.completion.autoCloseRemovesContent"?:      boolean;
    "xml.completion.autoCloseTags"?:                boolean;
    "xml.extension.jars"?:                          any[];
    "xml.fileAssociations"?:                        XMLFileAssociation[];
    "xml.format.closingBracketNewLine"?:            boolean;
    "xml.format.emptyElements"?:                    XMLFormatEmptyElements;
    "xml.format.enabled"?:                          boolean;
    "xml.format.enforceQuoteStyle"?:                XMLFormatEnforceQuoteStyle;
    "xml.format.joinCDATALines"?:                   boolean;
    "xml.format.joinCommentLines"?:                 boolean;
    "xml.format.joinContentLines"?:                 boolean;
    "xml.format.preserveAttributeLineBreaks"?:      boolean;
    "xml.format.preservedNewlines"?:                number;
    "xml.format.preserveEmptyContent"?:             boolean;
    "xml.format.spaceBeforeEmptyCloseTag"?:         boolean;
    "xml.format.splitAttributes"?:                  boolean;
    "xml.format.splitAttributesIndentSize"?:        number;
    "xml.format.xsiSchemaLocationSplit"?:           XMLFormatXsiSchemaLocationSplit;
    "xml.java.home"?:                               null | string;
    "xml.logs.client"?:                             boolean;
    "xml.preferences.quoteStyle"?:                  XMLPreferencesQuoteStyle;
    "xml.preferences.showSchemaDocumentationType"?: XMLPreferencesShowSchemaDocumentationType;
    "xml.server.binary.args"?:                      string;
    /**
     * Specify the path of a custom binary version of the XML server to use. A binary will be
     * downloaded if this is not set.
     */
    "xml.server.binary.path"?:          string;
    "xml.server.binary.trustedHashes"?: string[];
    /**
     * By default, vscode-xml tries to run the Java version of the XML Language Server. If no
     * Java is detected, vscode-xml runs the binary XML language server. When this setting is
     * enabled, the binary will also be used even if Java is installed. If there are additions
     * to the XML Language Server provided by other extensions, Java will be used (if available)
     * even if this setting is enabled.
     */
    "xml.server.preferBinary"?: boolean;
    /**
     * The XML Language server allows other VSCode extensions to extend its functionality. It
     * requires Java-specific features in order to do this. If extensions to the XML language
     * server are detected, but a binary XML language server is run, a warning will appear. This
     * setting can be used to disable this warning.
     */
    "xml.server.silenceExtensionWarning"?:     boolean;
    "xml.server.vmargs"?:                      null | string;
    "xml.server.workDir"?:                     string;
    "xml.symbols.enabled"?:                    boolean;
    "xml.symbols.excluded"?:                   string[];
    "xml.symbols.filters"?:                    XMLSymbolsFilter[];
    "xml.symbols.maxItemsComputed"?:           number;
    "xml.symbols.showReferencedGrammars"?:     boolean;
    "xml.trace.server"?:                       XMLTraceServer;
    "xml.validation.disallowDocTypeDecl"?:     boolean;
    "xml.validation.enabled"?:                 boolean;
    "xml.validation.namespaces.enabled"?:      XMLValidationNamespacesEnabled;
    "xml.validation.noGrammar"?:               XMLValidationNoGrammar;
    "xml.validation.resolveExternalEntities"?: boolean;
    "xml.validation.schema.enabled"?:          XMLValidationSchemaEnabled;
}

export interface XMLFileAssociation {
    pattern: string;
    /**
     * The path or URL to the XML schema (XSD or DTD).
     */
    systemId: string;
}

type XMLFormatEmptyElements =
    "collapse" |
    "expand" |
    "ignore"

type XMLFormatEnforceQuoteStyle =
    "ignore" |
    "preferred"

type XMLFormatXsiSchemaLocationSplit =
    "none" |
    "onElement" |
    "onPair"

type XMLPreferencesQuoteStyle =
    "double" |
    "single"

type XMLPreferencesShowSchemaDocumentationType =
    "all" |
    "appinfo" |
    "documentation" |
    "none"

export interface XMLSymbolsFilter {
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

type XMLTraceServer =
    "messages" |
    "off" |
    "verbose"

type XMLValidationNamespacesEnabled =
    "always" |
    "never" |
    "onNamespaceEncountered"

type XMLValidationNoGrammar =
    "error" |
    "hint" |
    "ignore" |
    "info" |
    "warning"

type XMLValidationSchemaEnabled =
    "always" |
    "never" |
    "onValidSchema"

export {}
