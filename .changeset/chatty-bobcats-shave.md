---
'vscode-framework': patch
---

Fix critical regression where extensions were unable to launch because injected variable was removed. I knew that it might happen, but unforunately I updated snapshot of injected code carelessly
