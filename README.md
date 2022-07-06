## Setup

Make sure to install the dependencies

```bash
npm install
```

Configure your GIT repo to use the GIT hooks from  the directory `.githooks`:

```bash
git config core.hooksPath .githooks
```

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
