#!/usr/bin/env node
import { Command } from 'commander';
import { esbuildBuild, generateTypes, writeManifest } from './cli';

const program = new Command();

// split into two commands
const generateManifestCommand = program.command('generate-manifest');
generateManifestCommand.description('Generates package.json for extension. Use this command before consuming extension!');
generateManifestCommand.option('--overwrite-cwd', 'disable stopping you from occasional main package.json overwriting', false);
generateManifestCommand.option('--overwrite', 'whether to fully overwrite if target package.json exists', true);
generateManifestCommand.action(async () => {
    await writeManifest({ output: 'test.json', overwrite: true });
});
const generateTypesCommand = program.command('generate-types');
generateTypesCommand.description('Generate TypeScript typings (from contribution points) for working with framework');

generateTypesCommand.action(async () => {
    await generateTypes(process.cwd());
});

const esbuildCommand = program.command('start');
esbuildCommand.description('Launch VSCode development with extension (no launch.json needed)');

esbuildCommand.action(async () => {
    await esbuildBuild('development');
});

// const buildCommand = program.command('build', 'Make a productive-ready production build');

program.parse(process.argv);

// const packageCommand = program.command('package', 'Launch VSCode development with extension (no launch.json needed)');

// const migrateCommand = program.command('migrate [path to package.json]', 'Migrate from regular package.json in interactive way (cleans contribution points, adds config)');

// const validate = program.command('validate')
