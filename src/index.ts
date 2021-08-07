/// <reference path="../build/client.d.ts" />
import vscode from 'vscode';
import { ReadonlyDeep } from 'type-fest';

export type CommandsExport = ReadonlyDeep<{
    regular: Array<{
        command: string;
        title: string;
        description?: string;
    }>;
}>;

export class VscodeFramework<T extends CommandsExport> {
    outputChannel: vscode.OutputChannel;
    private readonly commandPrefix: string;

    constructor(
        public commands: T,
        public readonly ctx: vscode.ExtensionContext,
    ) {
        this.outputChannel = vscode.window.createOutputChannel(process.env.EXTENSION_DISPLAY_NAME);
        console.log = (...args) => {
            this.outputChannel.appendLine(args.join(" "));
        }
        if (process.env.NODE_ENV === 'development' && process.env.REVEAL_OUTPUT_PANEL_IN_DEVELOPMENT !== "false") this.outputChannel.show(true);
        // process.on("unhandledRejection", (err: Error) => {
        //     // vscode.window.showErrorMessage(`Extension ${process.env.EXTENSION_DISPLAY_NAME} Crashed`, {
        // process.on("uncaughtExceptionMonitor", (err: Error) => {

        this.commandPrefix = process.env.EXTENSION_ID_NAME;
    }

    public registerCommand(command: T['regular'][number]['command'], callback: () => Promise<void> | void) {
        this.ctx.subscriptions.push(
            vscode.commands.registerCommand(`${this.commandPrefix}.${command}`, callback),
        );
    }
}
