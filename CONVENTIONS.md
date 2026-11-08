# Conventions

How to write code in Brutal Diamond.

## Structure

```
src/primitives/<name>/
  <Name>.svelte           component
  <Name>.stories.svelte   stories, title 'Primitives/<Name>'
  <Name>.test.ts          browser tests
  index.ts                export { default as Name, type NameProps, ... } from './Name.svelte';
```

- One kebab-case folder per component. Sub-parts (`CardHeader`) stay in the parent folder; related
  components share a group folder (`typography/`).
- Export every public type of the component (props, variants) next to it.
- Re-export each folder from `src/primitives/index.ts`. Export components individually (no barrel
  object) so bundlers can tree-shake.

## Components

| Rule              | Convention                                              |
| ----------------- | ------------------------------------------------------- |
| Variants          | One string union (`'primary' \| 'secondary'`)           |
| Boolean props     | Independent modifiers only (`icon`, `required`)         |
| Native attributes | Extend `HTMLButtonAttributes` and spread `...rest` last |
| Defaults          | Set safe ones explicitly (`type="button"`)              |
| Elements          | Semantic HTML (`button`, `a`, `label`)                  |
| Composition       | Build on existing components (`Dialog`, `Button`)       |

Props live in a `module` script so the type is exported:

```svelte
<script lang="ts" module>
	/** Visual style of a button. */
	export type ButtonVariant = 'primary' | 'secondary';

	type CommonProps = {
		/** Visual style. Defaults to `'primary'`. */
		variant?: ButtonVariant;
	};

	/** Props of `Button`: a `<button>`. */
	export type ButtonProps = CommonProps & HTMLButtonAttributes;
</script>

<script lang="ts">
	let { variant = 'primary', class: className, children, ...rest }: ButtonProps = $props();
</script>

<button class={['btn', variant, className]} {...rest}>{@render children?.()}</button>
```

## Styles

Wrap everything in the component layer, and only use tokens:

```svelte
<style>
	@layer bd.components {
		.btn {
			padding: var(--padding-action);
			border: var(--border-thin);
			box-shadow: var(--shadow-flat);
		}
		.btn:not(:disabled)[aria-pressed='true'] {
			box-shadow: var(--shadow-pressed);
		}
	}
</style>
```

- **Layer:** `@layer bd.components` lets consumers override with plain CSS, without `!important`.
- **Tokens:** no literal colour, spacing, border, shadow, font or duration. Layout values
  (`width: 100%`, `aspect-ratio`, `z-index`) can stay literal.
  Families: `--color-*`, `--gap-*`, `--padding-*`, `--border-*`, `--radius-*`, `--shadow-*`, `--font-*`.
- **Where they live:** layout, derived tokens (shadows, composite borders) and the default value of
  every component token in `src/styles/tokens.css`; per-theme primitives in
  `src/styles/theming/themes/`; neutrals per colour mode in `src/styles/theming/modes/`.
- **Theme files:** a theme starts from the primitives (accent palette, `--shadow-offset`, font
  weights, tracking) and the shadows and composite borders derived from them. It may override any
  token when its design calls for it (`--shadow-pressed`, `--border-style-alt`, a component token).
- **Theme differences:** add a component token (`--button-filled-shadow`) with its default in
  `tokens.css` (or a `var()` fallback in the component) and override it per theme. Components stay
  theme-agnostic.
- **States:** select on ARIA (`[aria-pressed='true']`, `[aria-current='page']`) and guard
  interactions against every way the element can be disabled (`:disabled` for native controls,
  `[aria-disabled='true']` for the others).
- **Text on coloured fills:** `--color-on-accent`.

## Accessibility

- Expose state through ARIA attributes, not only classes.
- The Storybook a11y addon must stay clean; fix violations instead of disabling rules.

## Tests & stories

|         | Tests (`*.test.ts`)                      | Stories (`*.stories.svelte`)                   |
| ------- | ---------------------------------------- | ---------------------------------------------- |
| Tooling | `vitest-browser-svelte`, real Chromium   | `defineMeta` + `<Story>`                       |
| Query   | `page.getByRole(role, { name })`         | `within(canvasElement).getByRole(...)`         |
| Cover   | default, each variant/prop, events, ARIA | one story per variant, `argTypes` for controls |
| Extra   | assert behaviour, not markup             | `play` functions run as tests                  |

## Comments & JSDoc

- **Exports:** every exported type, prop and function gets a one-sentence `/** */`, capitalised,
  ending with a period. State the default (`Defaults to 'primary'.`) and when a prop is
  conditional (`Only used with href.`).
- **Describe the consumer's view**, not the implementation.
- **Public helpers** (`setTheme`, `getTheme`) also use `@param` and note side effects (async,
  writes `data-theme` on `<html>`). Leave the types out of `@param` and `@returns`; TypeScript
  already states them.
- **Allowed comments:** JSDoc, lint/check suppressions and TypeScript directives only. No inline `//` or `/* */`
  comments in any language.
- **Lint suppressions** stay narrow and close right after the line they cover.

```ts
/** Renders an `<a>` pointing to this URL instead of a `<button>`. */
href?: string;
/** Browsing context of the link. Only used with `href`. */
target?: HTMLAnchorAttributes['target'];
```

## Naming

| What                | Style            | Example                  |
| ------------------- | ---------------- | ------------------------ |
| Component / file    | `PascalCase`     | `CardHeader.svelte`      |
| Folder, plain `.ts` | `kebab-case`     | `control-height.test.ts` |
| CSS class           | short, lowercase | `btn`, `primary`         |
| Token               | `--family-name`  | `--shadow-flat`          |

Formatting is Prettier's job (tabs, single quotes, 100 cols).
