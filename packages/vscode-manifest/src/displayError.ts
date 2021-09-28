import { red, bgRed } from 'chalk'

export const displayError = (message: string) => {
    console.error(bgRed(' ERROR '), red(message))
}

// TODO review the approach
/** Throwed in cases where we are already printed error and don't need node.js to print anything */
export class UnprintableError extends Error {
    override name = 'UnprintableError'
    constructor() {
        super()
    }
}
