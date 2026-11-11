# Brutal Diamond

Neo-brutalist [Svelte 5](https://svelte.dev) component library built on design tokens.

## Features

- **Svelte 5** components, individually exported and tree-shakeable
- **Design tokens** as CSS custom properties, scoped in CSS cascade layers (`bd.tokens`, `bd.base`, `bd.components`)
- **Themes and colour modes**: Neo-Brutalism (default) and Outline; light and dark
- **Accessible**: axe checks and WCAG contrast tests on the tokens
- **Typed**: every component exports its props and variant types

## Installation

```sh
npm install brutal-diamond
```

Requires `svelte@^5.29`. The default font, Karla, is an optional peer dependency:

```sh
npm install @fontsource-variable/karla
```

## Usage

Import the base styles once, at your app root:

```ts
import 'brutal-diamond/styles.css';
import 'brutal-diamond/font'; // optional: loads Karla
```

Then use the components:

```svelte
<script lang="ts">
	import { Button, Card, CardContent, Input } from 'brutal-diamond';
</script>

<Card>
	<CardContent>
		<Input placeholder="Email" />
		<Button variant="primary">Subscribe</Button>
	</CardContent>
</Card>
```

## Components

| Group      | Components                                                           |
| ---------- | -------------------------------------------------------------------- |
| Actions    | `Button` (`primary`, `secondary`, `outline`, `destructive`; or link) |
| Form       | `Input`, `InputFile`, `Select`, `Textarea`                           |
| Typography | `H1`, `H2`, `H3`, `P`, `Caption`, `Label`, `Link`                    |
| Layout     | `Card` (+ `CardHeader`, `CardContent`, `CardMedia`, `CardFooter`)    |
| Lists      | `List`, `ListItem`                                                   |
| Feedback   | `Badge`, `Notice`, `Toast`, `Toaster` + `toaster`                    |
| Navigation | `Tabs` (+ `TabList`, `Tab`, `TabPanel`)                              |
| Overlays   | `Dialog`, `Confirmation`                                             |

Browse them all, with live props, in Storybook (see [Development](#development)).

## Theming

Themes set the design (borders, shadows, type); modes set the colours. Both are applied with
`data-theme` and `data-mode` attributes on the root element.

Neo-Brutalism and light are built into `styles.css`. Other themes and modes are separate files:

```ts
import 'brutal-diamond/themes/outline.css';
import 'brutal-diamond/modes/dark.css';
```

```html
<html data-theme="outline" data-mode="dark"></html>
```

The library also exposes helpers that load the CSS on demand and set the attributes for you:

```ts
import { setTheme, setMode, getTheme, getMode, themeOptions, modeOptions } from 'brutal-diamond';

await setTheme('outline'); // loads the theme's CSS, then applies it
await setMode('dark');
await setMode(null); // back to the theme's own mode
```

`THEMES`, `MODES`, `isTheme` and `isMode` are also exported, and `themeOptions` / `modeOptions`
are ready to feed a picker.

## Development

Requires Node 24 and npm 11.

```sh
npm install
npm run storybook      # component explorer on http://localhost:6006
npm test               # vitest (browser tests, via Playwright)
npm run test:coverage  # with coverage
npm run check          # svelte-check
npm run lint           # prettier + eslint
npm run format         # prettier --write
npm run build          # package to dist/ and run publint
```

Contributions should follow [CONVENTIONS.md](CONVENTIONS.md).

## License

[MIT](LICENSE.md) © [Diamons](https://github.com/Neo-Diamons)
