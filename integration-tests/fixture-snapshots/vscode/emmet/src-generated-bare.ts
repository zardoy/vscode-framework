export interface RegularCommands {
    "emmet.action.wrapWithAbbreviation": true
    "emmet.action.removeTag": true
    "emmet.action.updateTag": true
    "emmet.action.matchTag": true
    "emmet.action.balanceIn": true
    "emmet.action.balanceOut": true
    "emmet.action.prevEditPoint": true
    "emmet.action.nextEditPoint": true
    "emmet.action.mergeLines": true
    "emmet.action.selectPrevItem": true
    "emmet.action.selectNextItem": true
    "emmet.action.splitJoinTag": true
    "emmet.action.toggleComment": true
    "emmet.action.evaluateMathExpression": true
    "emmet.action.updateImageSize": true
    "emmet.action.incrementNumberByOneTenth": true
    "emmet.action.incrementNumberByOne": true
    "emmet.action.incrementNumberByTen": true
    "emmet.action.decrementNumberByOneTenth": true
    "emmet.action.decrementNumberByOne": true
    "emmet.action.decrementNumberByTen": true
    "emmet.action.reflectCSSValue": true
    "action.showEmmetCommands": true
}


export interface Configuration {
    excludeLanguages?:            string[];
    extensionsPath?:              string[];
    includeLanguages?:            { [key: string]: string };
    optimizeStylesheetParsing?:   boolean;
    preferences?:                 Preferences;
    showAbbreviationSuggestions?: boolean;
    showExpandedAbbreviation?:    "always" | "inMarkupAndStylesheetFilesOnly" | "never";
    showSuggestionsAsSnippets?:   boolean;
    syntaxProfiles?:              { [key: string]: any };
    triggerExpansionOnTab?:       boolean;
    variables?:                   Variables;
}

export interface Preferences {
    "bem.elementSeparator"?:           string;
    "bem.modifierSeparator"?:          string;
    "css.color.short"?:                boolean;
    "css.floatUnit"?:                  string;
    "css.fuzzySearchMinScore"?:        number;
    "css.intUnit"?:                    string;
    "css.mozProperties"?:              string;
    "css.msProperties"?:               string;
    "css.oProperties"?:                string;
    "css.propertyEnd"?:                string;
    "css.valueSeparator"?:             string;
    "css.webkitProperties"?:           string;
    "filter.commentAfter"?:            string;
    "filter.commentBefore"?:           string;
    "filter.commentTrigger"?:          any[];
    "format.forceIndentationForTags"?: any[];
    "format.noIndentTags"?:            any[];
    "output.inlineBreak"?:             number;
    "output.reverseAttributes"?:       boolean;
    "output.selfClosingStyle"?:        "html" | "xhtml" | "xml";
    "profile.allowCompactBoolean"?:    boolean;
    "sass.propertyEnd"?:               string;
    "sass.valueSeparator"?:            string;
    "stylus.propertyEnd"?:             string;
    "stylus.valueSeparator"?:          string;
}export interface Variables {
    charset?: string;
    lang?:    string;
}
export {}
