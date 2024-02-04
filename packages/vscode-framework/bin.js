#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-require-imports
/** @type{import('./src/cli/commands').commander} */
const commander = require('./build/cli/commands').commander
commander.process()
