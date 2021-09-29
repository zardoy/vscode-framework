import { red, bgRed } from 'chalk'

export const displayError = (message: string) => {
    console.error(bgRed(' ERROR '), red(message))
}
