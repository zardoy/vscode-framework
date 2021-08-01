//@ts-check
import { build as esbuildBuild } from "esbuild"
import { readFile } from "jsonfile";
import path from "path";

export const build = async (NODE_ENV: "development" | "production", entryPoint = "src/index.ts", outfile = "out.js") => {
    const EXTENSION_NAME = await readFile(path.join(process.cwd(), "package.json")).then(p => p.name)
    
    const result = await esbuildBuild({
        bundle: true,
        watch: NODE_ENV === "development",
        minify: NODE_ENV === "production",
        define: {
            "process.env.NODE_ENV": `"${NODE_ENV}"`,
            "process.env.EXTENSION_NAME": `"${EXTENSION_NAME}"`
        },
        entryPoints: [
            entryPoint
        ],
        external: [
            "vscode"
        ],
        platform: "node",
        outfile,
    })
}
