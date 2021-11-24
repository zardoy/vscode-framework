export interface RegularCommands {
}


export interface Configuration {
    /**
     * %html.autoClosingTags%
     */
    autoClosingTags?: boolean;
    /**
     * %html.completion.attributeDefaultValue%
     */
    "completion.attributeDefaultValue"?: "doublequotes" | "empty" | "singlequotes";
    customData?:                         string[];
    "format.contentUnformatted"?:        null | string;
    /**
     * %html.format.enable.desc%
     */
    "format.enable"?: boolean;
    /**
     * %html.format.endWithNewline.desc%
     */
    "format.endWithNewline"?:      boolean;
    "format.extraLiners"?:         null | string;
    "format.indentHandlebars"?:    boolean;
    "format.indentInnerHtml"?:     boolean;
    "format.maxPreserveNewLines"?: number | null;
    /**
     * %html.format.preserveNewLines.desc%
     */
    "format.preserveNewLines"?: boolean;
    /**
     * %html.format.templating.desc%
     */
    "format.templating"?:                  boolean;
    "format.unformatted"?:                 null | string;
    "format.unformattedContentDelimiter"?: string;
    /**
     * %html.format.wrapAttributes.desc%
     */
    "format.wrapAttributes"?:           "aligned-multiple" | "auto" | "force" | "force-aligned" | "force-expand-multiline" | "preserve" | "preserve-aligned";
    "format.wrapAttributesIndentSize"?: number | null;
    /**
     * %html.format.wrapLineLength.desc%
     */
    "format.wrapLineLength"?: number;
    /**
     * %html.hover.documentation%
     */
    "hover.documentation"?: boolean;
    /**
     * %html.hover.references%
     */
    "hover.references"?: boolean;
    /**
     * %html.mirrorCursorOnMatchingTag%
     */
    mirrorCursorOnMatchingTag?: boolean;
    /**
     * %html.suggest.html5.desc%
     */
    "suggest.html5"?: boolean;
    /**
     * %html.trace.server.desc%
     */
    "trace.server"?: "messages" | "off" | "verbose";
    /**
     * %html.validate.scripts%
     */
    "validate.scripts"?: boolean;
    /**
     * %html.validate.styles%
     */
    "validate.styles"?: boolean;
}
export {}
