// provides methods for console logging and clearing

import kleur from 'kleur'

const formatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
})

export const logConsole = (level: 'log', ...message: string[]) => {
    // this format belongs to Vite
    console.log(kleur.gray(formatter.format(new Date())), kleur.bold().cyan('[vscode-framework]'), ...message)
}

export const clearConsole = (keepHistory: boolean, keepLastScreen: boolean) => {
    if (keepHistory && keepLastScreen) process.stdout.write('\n'.repeat(process.stdout.rows))

    process.stdout.write(keepHistory ? '\u001B[H\u001B[2J' : '\u001B[2J\u001B[3J\u001B[H\u001Bc')
}
