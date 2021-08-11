import { enableHotReload, hotRequire } from '@hediet/node-reload';
import * as vscode from 'vscode';
import chalk from 'chalk';
import { MaybePromise } from './util';

type AsyncVoid = MaybePromise<void>;

interface Extension {
    activate: (ctx: vscode.ExtensionContext) => AsyncVoid;
    deactivate?: () => AsyncVoid;
}

enableHotReload({ entryModule: module });

export const activate = (ctx: vscode.ExtensionContext) => {
    hotRequire<Extension>(module, './extension.js', ({ activate, deactivate }) => {
        void activate(ctx);

        return {
            dispose: () => {
                const promise = deactivate?.();
                if (promise) console.log(chalk.yellow.bold('Warning: '), chalk.yellow('deactivate promises can\'t be handled gracefully consider sync disposing'));
            },
        };
    });
};
