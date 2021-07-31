import { join } from "path/posix";
import { updatePackageJson } from "."

// TODO use commander or something like that

const [command = "help", arg1 = "", arg2 = ""] = process.argv.slice(2)

const commands = {
    // doesn't support typescript files
    "update-metadata": async () => {
        if (!arg1) throw new TypeError(`Commands export isn't provided`)
        const [path, moduleExport] = arg1.split("#")
        const commands = (await import(join(__dirname, path!)))[moduleExport!];
        await updatePackageJson({ 
            where: "original",
            commands
        })
    },
}

commands[command]()