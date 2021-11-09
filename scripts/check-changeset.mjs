import fs from 'fs'

const files = await fs.promises.readdir('./.changeset')
if (files.length > 2) throw new Error('Changeset versions must be resolved. Run `changesets version`')
