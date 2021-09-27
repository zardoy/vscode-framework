// this is just a wrapper for better types support

import { Command, CommandOptions } from 'commander'
import { pick } from 'lodash'
import { CamelCase } from 'type-fest'
import { pickObject } from '../util'

namespace CommandArguments {
    type IsRequired<T extends string> = T extends `<${string}>` ? true : T extends `[${string}]` ? false : never
    type ExtractString<T extends string> = T extends `<${infer U}>` ? U : T extends `[${infer U}]` ? U : never

    type Simplify<T> = { [K in keyof T]: T[K] }

    export type ArgumentsArr = (`[${string}]` | `<${string}>`)[]

    export type MakeArguments<T extends ArgumentsArr> = Simplify<
        {
            [K in keyof T as K extends `${number}`
                ? IsRequired<T[K] & string> extends true
                    ? ExtractString<T[K] & string>
                    : never
                : never]: string
        } & {
            [K in keyof T as K extends `${number}`
                ? IsRequired<T[K] & string> extends false
                    ? ExtractString<T[K] & string>
                    : never
                : never]?: string
        }
    >
}

type D = CommandArguments.MakeArguments<'[path]'[]>

export class SuperCommander<C extends Record<string, any> | undefined = undefined> {
    program: Command
    // why do we lose type here?? C?
    private loadConfig: ((commandName: string) => Record<string, any> | Promise<Record<string, any>>) | undefined
    constructor(
        ...[program, loadConfig]: C extends undefined
            ? [program: Command]
            : [program: Command, loadConfig: (commandName: string) => C | Promise<C>]
    ) {
        this.program = program
        this.loadConfig = loadConfig
    }

    // extremely raw I just created it for my needs
    // doesn't support:
    // - arguments
    // - options starting with --no
    command<
        S extends string,
        A extends CommandArguments.ArgumentsArr,
        O extends Record<string, { description: string; short?: string; defaultValue: string | boolean }> = {},
        E extends boolean = false,
    >(
        name: S,
        description: string,
        options: CommandOptions & {
            arguments?: A
            options?: O
            loadConfig?: E
        } = {},
        action: (
            options: { [K in keyof O as K extends `--${infer U}` ? CamelCase<U> : never]: O[K]['defaultValue'] },
            params: {
                arguments: CommandArguments.MakeArguments<A>
                commandName: S
                config: E extends true ? (C extends Record<string, any> ? C : undefined) : undefined
            },
        ) => void | Promise<void>,
    ) {
        // TODO review. should start with uppercase
        type NotPreciseOptionType = CamelCase<'Overwrite-manifestYes'> /** this is actually valid option */
        const command = this.program
            .command(
                options.arguments ? `${name} ${options.arguments.join(' ')}` : name,
                pickObject(options, ['hidden', 'isDefault', 'noHelp'] as (keyof CommandOptions)[]),
            )
            .description(description)

        if (options.options) {
            for (let [optionName, { description, defaultValue: value, short }] of Object.entries(options.options)) {
                // my type is misbehaving?
                if (short) optionName = `${short} ${optionName}` as any
                if (typeof value === 'string') optionName = `${optionName} [string]` as any
                command.option(optionName, description, value)
            }
        }
        command.action(async (...args) => {
            args = args.slice(0, -1) // last arg is commander
            const config = options.loadConfig ? await this.loadConfig?.(name) : undefined
            // we have args
            const mappedArgs = {}
            if (args.length > 1) {
                // const commandArgs: string[] = args.slice(0, -1)
                // for (const arg of commandArgs) {
                //     mappedArgs[arg.slice(1, -1) =
                // }
            }
            await action(args.slice(-1)[0], {
                commandName: name,
                config: config as any,
                arguments: options.arguments && args.length > 1 ? ({ [options.arguments![0]!]: args[0] } as any) : {},
            })
        })
        return command
    }

    /** must be called at the end, to process added commands */
    process() {
        this.program.parse(process.argv)
    }
}
