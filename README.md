### [Documentation](https://foxhound87.github.io/mobx-formkit/devtools) &bull; [Live Demo](https://foxhound87.github.io/mobx-formkit-demo) &bull; [Demo Code](https://github.com/foxhound87/mobx-formkit-demo) &bull; [NPM](https://www.npmjs.com/package/mobx-formkit-devtools) &bull; [Skills](https://github.com/foxhound87/skills) &bull; [Tutorial](https://medium.com/@foxhound87/automagically-manage-react-forms-state-with-mobx-and-automatic-validation-2b00a32b9769) &bull; [Join Discord Channel](https://discord.gg/CVV8w4zat4)

# MobX FormKit DevTools

DevTools for [MobX FormKit](https://github.com/foxhound87/mobx-formkit) — a
browser extension (Chrome / Firefox / Edge) plus an in-app dock SDK.

> [!NOTE]
> The devtools are **opt-in**: they only activate on pages that import
> `mobx-formkit/devtools`.

## Prerequisites

The page under inspection must install the devtools hook. Import it **before**
creating your forms (e.g. at the top of the client entry):

```ts
import 'mobx-formkit/devtools';
```

## Build

```bash
npm install
npm run build:ext
```

This produces the unpacked extensions in `extension/dist/{chrome,firefox,edge}`.

## Install

### Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked**.
4. Select `extension/dist/chrome`.

### Edge

1. Open `edge://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select `extension/dist/edge`.

### Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…**.
3. Select `extension/dist/firefox/manifest.json`.

> Dev-mode shortcut (build + launch in one command):
> `npm run dev:chrome` · `npm run dev:firefox` · `npm run dev:edge`

## How to use

1. Open a page that imports `mobx-formkit/devtools`.
2. Open DevTools (`F12` / `Cmd+Opt+I`).
3. Go to the **"MobX FormKit"** panel (overflow menu `»` if hidden).
4. Pick a form from the selector and inspect it:
   - **Form** — form-level props
   - **Options** — toggle boolean form options (search + grouped)
   - **Values** — current field values
   - **Fields** — full field snapshots
   - **Helpers** — errors, labels, placeholders, defaults, rules, bindings, …
   - Controls: **Submit / Validate / Reset / Clear**

The panel updates live (per-form) and shows a connection status dot in the
top-right corner.

## In-app dock (SDK)

The in-app dock is shipped per engine — React is exposed via the `/react`
subpath.

```bash
npm i mobx-formkit-devtools
```

```tsx
import DevTools from 'mobx-formkit-devtools/react';
import forms from './forms';

DevTools.register(forms);   // register your forms ({ name: form })
DevTools.select('login');   // select a form (optional)
DevTools.open(true);        // open the dock

function App() {
  return (
    <>
      <DevTools.UI />        {/* render the dock once, at the app root */}
      {/* your app */}
    </>
  );
}
```

API:

- `DevTools.UI` — the dock component (render it once, at the app root).
- `DevTools.register(forms)` — register an object of forms (`{ name: form }`).
- `DevTools.select(key)` — select a form by key.
- `DevTools.open(flag)` — open/close the dock.
- `DevTools.Options` — the form-options component.
- `DevTools.theme({ … })` — override the color theme.

The React SDK expects these **peer dependencies** (install them alongside):

- `react` / `react-dom`
- `mobx` (`^6.12 || ^7`)
- `mobx-react`
- `mobx-formkit` (the form library; the legacy `mobx-react-form` name is also supported)

## License

MIT
