<!-- .github/copilot-instructions.md - guidance for AI coding agents -->
# Copilot Instructions for Task Forge

Purpose: Help an AI coding agent become productive quickly in this Vite + React repository.

- **Run / Build**: use `npm` scripts defined in `package.json`.

  - Start dev server:
    ```powershell
    npm run dev
    ```
  - Build for production:
    ```powershell
    npm run build
    ```
  - Preview built site:
    ```powershell
    npm run preview
    ```
  - Lint the codebase:
    ```powershell
    npm run lint
    ```

- **Big-picture architecture (quick)**:
  - Vite + React app (ESM, `type: "module"`). Entry point: `src/main.jsx` which mounts `App` from `src/App.jsx`.
  - Static assets: `public/` for files served as-is, `src/assets/` for imported assets.
  - Config files to check: `vite.config.js`, `eslint.config.js`, `index.html` (project root).
  - Note: `package.json` pins `vite` to `rolldown-vite` via an override. This is intentional and can affect plugin behavior — prefer inspecting `vite.config.js` before changing plugin settings.

- **Project-specific conventions**:
  - Components use `.jsx` files and are imported directly (see `src/main.jsx` and `src/App.jsx`).
  - Global CSS is imported from `src/index.css` in `src/main.jsx`.
  - The project currently has no test framework configured — do not assume tests are present.

- **Common change patterns**:
  - To add a new page/feature: create components under `src/`, import them in `App.jsx` or add a router if needed.
  - To add assets: put static files in `public/` for direct URL access or `src/assets/` to import in JS/CSS.
  - When modifying build or dev behavior, update `vite.config.js` and test with `npm run dev` and `npm run build`.

- **Linting & formatting**:
  - Run `npm run lint` before commits. ESLint config is in `eslint.config.js`.

- **Debugging tips**:
  - Use the browser console and Vite terminal output while running `npm run dev` for HMR and plugin errors.
  - If build errors reference Vite plugins, remember `package.json` maps `vite` to `rolldown-vite` (see `overrides`).

- **Where to look first (file pointers)**:
  - Entry: `src/main.jsx` — app bootstrapping.
  - Root component: `src/App.jsx` — main UI structure.
  - Configs: `vite.config.js`, `eslint.config.js`, `index.html`.
  - Scripts & deps: `package.json` (notably `scripts`, `dependencies`, and `devDependencies`).

- **When merging with an existing `.github/copilot-instructions.md`**:
  - Preserve any repository-specific custom rules already present.
  - Merge by keeping unique concrete commands, file pointers, and any team conventions.

If anything important (CI, secret management, mono-repo behavior, or custom dev scripts) is missing from these notes, tell me which files or commands I should inspect and I'll update this file accordingly.
