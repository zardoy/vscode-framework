// Type that framework requires

import { PackageJson, SetRequired } from 'type-fest'
import { ExtensionManifest } from './sourceType'

export { ExtensionManifest } from './sourceType'

/** Extension manifest with required fields. Used for validation */
export type ExtensionManifestRequired = SetRequired<
    ExtensionManifest,
    'displayName' | 'categories' | 'publisher' | 'contributes'
> &
    Required<Pick<PackageJson, 'name' | 'version'>>

/** All manifest and package.json fields */
export type ManifestType = PackageJson & ExtensionManifestRequired

/** type of `contributes.configuration` (not array) */
export type ContributesConfigurationType = NonNullable<Exclude<ManifestType['contributes']['configuration'], any[]>>
