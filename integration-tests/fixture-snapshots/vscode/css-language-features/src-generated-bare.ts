export interface RegularCommands {
}


export interface Configuration {
    /**
     * %less.completion.completePropertyWithSemicolon.desc%
     */
    "completion.completePropertyWithSemicolon"?: boolean;
    /**
     * %less.completion.triggerPropertyValueCompletion.desc%
     */
    "completion.triggerPropertyValueCompletion"?: boolean;
    customData?:                                  string[];
    /**
     * %less.hover.documentation%
     */
    "hover.documentation"?: boolean;
    /**
     * %less.hover.references%
     */
    "hover.references"?: boolean;
    /**
     * %less.lint.argumentsInColorFunction.desc%
     */
    "lint.argumentsInColorFunction"?: "error" | "ignore" | "warning";
    "lint.boxModel"?:                 "error" | "ignore" | "warning";
    /**
     * %less.lint.compatibleVendorPrefixes.desc%
     */
    "lint.compatibleVendorPrefixes"?: "error" | "ignore" | "warning";
    /**
     * %less.lint.duplicateProperties.desc%
     */
    "lint.duplicateProperties"?: "error" | "ignore" | "warning";
    /**
     * %less.lint.emptyRules.desc%
     */
    "lint.emptyRules"?:         "error" | "ignore" | "warning";
    "lint.float"?:              "error" | "ignore" | "warning";
    "lint.fontFaceProperties"?: "error" | "ignore" | "warning";
    /**
     * %less.lint.hexColorLength.desc%
     */
    "lint.hexColorLength"?: "error" | "ignore" | "warning";
    /**
     * %less.lint.idSelector.desc%
     */
    "lint.idSelector"?: "error" | "ignore" | "warning";
    /**
     * %less.lint.ieHack.desc%
     */
    "lint.ieHack"?:    "error" | "ignore" | "warning";
    "lint.important"?: "error" | "ignore" | "warning";
    /**
     * %less.lint.importStatement.desc%
     */
    "lint.importStatement"?:             "error" | "ignore" | "warning";
    "lint.propertyIgnoredDueToDisplay"?: "error" | "ignore" | "warning";
    "lint.universalSelector"?:           "error" | "ignore" | "warning";
    /**
     * %less.lint.unknownAtRules.desc%
     */
    "lint.unknownAtRules"?: "error" | "ignore" | "warning";
    /**
     * %less.lint.unknownProperties.desc%
     */
    "lint.unknownProperties"?: "error" | "ignore" | "warning";
    /**
     * %less.lint.unknownVendorSpecificProperties.desc%
     */
    "lint.unknownVendorSpecificProperties"?: "error" | "ignore" | "warning";
    /**
     * %less.lint.validProperties.desc%
     */
    "lint.validProperties"?: string[];
    /**
     * %less.lint.vendorPrefix.desc%
     */
    "lint.vendorPrefix"?: "error" | "ignore" | "warning";
    /**
     * %less.lint.zeroUnits.desc%
     */
    "lint.zeroUnits"?: "error" | "ignore" | "warning";
    /**
     * %css.trace.server.desc%
     */
    "trace.server"?: "messages" | "off" | "verbose";
    /**
     * %less.validate.desc%
     */
    validate?: boolean;
}

export {}
