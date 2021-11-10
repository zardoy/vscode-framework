---
'vscode-framework': patch
---

Fix issues where vscode-framework couldn't be imported in foreign environments. This was done by adding a check if variable, that should be injected to the code later by the our bundler actually exists
