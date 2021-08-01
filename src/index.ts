import vscode from 'vscode';
import { ReadonlyDeep } from 'type-fest';

export type CommandsExport = ReadonlyDeep<{
    regular: {
        command: string;
        title: string;
        description?: string;
    }[]
}>

export class CommandRegisterer<T extends CommandsExport> {
    private commandPrefix: string;
    
    constructor(
        public commands: T,
        private ctx: vscode.ExtensionContext
    ) {
        this.commandPrefix = process.env.EXTENSION_NAME;
    }

    public registerCommand(command: T['regular'][number]['command'], callback: () => Promise<void> | void) {
        this.ctx.subscriptions.push(
            vscode.commands.registerCommand(`${this.commandPrefix}.${command}`, callback)
        );
    }
}
