import { PackageJson } from 'type-fest'

/** Remove fields that can affect installation of vscode-framework */
export const packageJsonCleanDeps = (packageJson: PackageJson) =>
    Object.fromEntries(
        Object.entries(packageJson).filter(([key]) => key !== 'scripts' && !key.toLowerCase().endsWith('dependencies')),
    )
