import type { ValidateFunction } from 'ajv'
import { bold, red } from 'chalk'
import { displayError } from './displayError'
import ajvValidateImport from './generated/validate.js'
import { intoTwoArrays, onlyProperties } from './util'
import { ManifestType } from '.'

/** Returns null if valid */
export const validateManifest = (manifest: ManifestType) => {
    // TODO fix ajv type
    const validateTyped = ajvValidateImport as unknown as ValidateFunction
    validateTyped(manifest)
    return !validateTyped.errors || validateTyped.errors.length === 0 ? null : [...validateTyped.errors]
}

/**
 * The same validation function, but returns nothing, prints errors in case of invalid manifest and throws
 * @throws in case if invalid
 */
export const validateOrThrow = (manifest: ManifestType) => {
    const errors = validateManifest(manifest)
    if (errors) {
        displayError('Invalid package.json')
        // TODO use single util method
        const [missingPackageJsonProps, otherErrors] = intoTwoArrays(
            errors,
            err => err.instancePath === '' && onlyProperties(err.params, ['missingProperty']),
        )
        if (missingPackageJsonProps.length > 0)
            console.error(
                `${red('Missing root properties:')} ${missingPackageJsonProps
                    .map(err => red(`\n- ${bold(err.params.missingProperty)}`))
                    .join('')}`,
            )

        if (otherErrors.length > 0) {
            if (missingPackageJsonProps.length > 0) console.error(red(`Other errors:`))
            for (const error of otherErrors)
                console.error(
                    `${red(
                        `- ${bold(
                            error.instancePath === '' ? 'root' : error.instancePath.slice(1).replace(/\//g, '.'),
                        )} ${error.message}`,
                    )}`,
                )
        }

        // TODO exclude from output
        throw new Error('validation error')
    }
}
