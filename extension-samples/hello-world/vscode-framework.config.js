/** @type{import('vscode-framework/build/config').UserConfig*/
const config = {
    development: {
        extensionBootstrap: {
            autoReload: {
                type: 'forced',
            },
        },
    },
}
module.exports = config
