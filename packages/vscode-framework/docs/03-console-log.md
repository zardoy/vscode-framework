Status: WIP

For now, console is not supported in browser.

But `global.console` remains unchanged, never use it!
<!-- TODO check for it -->

However, what was said above applies only for Node.js.
For browser environments, there is no `console.Console` method, so it's not easy to redirect output.

## WEB Notes

Though, it's a temporary limitation keep in mind, that when targeting browser environments, using such methods as `console.assert(false, ...)` will just literally kill your extension!
And using `console.log('%s there', 'hey')` simply won't work. However if don't use this feature and use only `log`, `debug`, `warn`, `error`, `debug`, `time`, `timeEnd` you are safe to go!

## Debug
