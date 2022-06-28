## Initial Setup of new project

* clone project: `git clone ssh://git@gitlab.satoshiengineering.com:222/templates/vue3.git`
* update dependencies: `npx npm-check-updates -u && npm install`
* commit + push: `git commit -m '[TASK] update all template packages' && git push`
* change origin: `git remote set-url origin <new-project-url>`
* update favicon
  * go to https://favicon.io/favicon-converter/
  * upload your svg + create favicons
  * replace all files in public
* add hooksPath: `git config core.hooksPath .githooks`
* remove "Initial Setup of new project" from the readme
* commit: `git commit -m '[TASK] initial commit projects#<issue-id>'`
* push to new project. `git push -u origin main`

## Setup

### VSCode Extensions

* [Vue Language Features (Volar)](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)
* [PostCSS Language Support](https://marketplace.visualstudio.com/items?itemName=csstools.postcss)
* [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

Do _not_ use Vetur, deinstall it, it was for Vue 2. Volar is recommended by the [Vue 3 Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).  
Do _not_ use the "TypeScript Vue Plugin (Volar)", but use "take over mode" of Volar (see right below).

#### Use Volar's take over mode (disable builtin Typescript extension)

* Make sure, "Vue Language Features (Volar)" is installed and activated (see above)
* In the commands input (Cmd/ctrl + shift + P), type in `builtin`
* Click on "Extensions: Show built-in Extensions"
* Search for `typescript`
* Disable "TypeScript and JavaScript Language Support" for Workspace only

## Development

Start the development server on http://localhost:3000

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```
