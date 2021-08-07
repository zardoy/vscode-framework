#!/usr/bin/env node
import { posix } from 'path';
import { updatePackageJson, build } from './cli';

// TODO use commander or something like that

let [command = 'help', arg1, arg2] = process.argv.slice(2);

const commands = {
    // doesn't support typescript files
    'update-metadata': async () => {
        if (!arg1) throw new TypeError('Commands export isn\'t provided');
        const [path, moduleExport] = arg1.split('#');
        const commands = (await import(posix.join(__dirname, path!)))[moduleExport!];
        await updatePackageJson({
            where: 'original',
            commands,
        });
    },
    esbuild: async () => {
        if (arg1 === 'dev') arg1 = 'development';
        if (arg1 === 'prod') arg1 = 'production';
        await build(arg1 as any, arg2);
    },
};

commands[command]().catch(console.error);
