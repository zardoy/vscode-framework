type SnippetLocation = 'lineStart' | 'topLineStart' | 'fileStart' | 'stringLiteral' | 'inComments'

export type Configuration = {
    customSnippets?: {
        [snippet: string]: {
            body: string
            when?: {
                // TODO check implementation
                /**
                 * - topLineStart means line start without indendation, useful for top-level declaration snippets, like `export const`
                 *  */
                locations?: Array<
                    | SnippetLocation
                    | {
                          /**
                           * @minLength 1
                           * @maxLength 1
                           */
                          afterSymbol: string
                      }
                >
                /** Its **really** cool, `true`  */
                location2?: SnippetLocation
                /** @default ["*"] */
                languages?: string[]
                // TODO: fileTypes top: package.json tsconfig.json etc
                /** Regexp against relative path. Example: tsconfig.json$. */
                pathRegex?: string
                // TODO: unimplemenetd
                /** Enable snippet only when these NPM dependencies are installed */
                npmDependencies?: string[]
            }
        }
    }
    /**
     * Enable opinionated builtin snippets
     * @default false
     *  */
    builtinSnippets:
        | false
        | {
              something?: true
          }
}
