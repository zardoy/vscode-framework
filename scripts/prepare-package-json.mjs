//@ts-check
import { modifyPackageJsonFile } from "modify-json-file";
import fs from "fs";

await fs.promises.copyFile("package.json", "build/package.json");

await modifyPackageJsonFile(
    "build/package.json",
    {
        main: "./index.js",
        types: "./index.d.ts"
    }
);