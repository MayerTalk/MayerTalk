# Repository Guidelines

## Project Structure & Module Organization

MayerTalk is a Vue 3 + Vite + TypeScript dialogue editor. Keep all application source in `src/`:

- `src/components/` – reusable UI components, grouped in subfolders with an `index.ts` barrel.
- `src/editor/` and `src/renderer/` – editor and renderer implementations.
- `src/lib/` – data, logic, language, and utility modules.
- `src/style/` – global styles and fonts.
- `build/` – Python build helpers.
- `.github/workflows/` – CI/CD pipelines for `dev` and `main`.

Import from `src/` using the `@` alias (for example `@/lib/utils/tool.ts`).

## Build, Test, and Development Commands

Use npm; `package-lock.json` is the source of truth.

- `npm install` – install dependencies.
- `npm run dev` – start the local Vite dev server.
- `npm run build` – run the TypeScript type check (`vue-tsc`) and production build.
- `npm run preview` – preview the built app locally.
- `npm run lint` – run ESLint across the project and apply fixes.
- `python build/dev.py` – build the dev-site bundle used by CI.

## Coding Style & Naming Conventions

- Use 4-space indentation, single quotes, and final newlines (see `.editorconfig`).
- Follow the ESLint configuration in `eslint.config.js`; run `npm run lint` before committing.
- Name `.vue` components in `PascalCase.vue` and plain TypeScript/JavaScript modules in `camelCase.ts`.
- Keep reusable components in a named subfolder with an `index.ts` barrel export.
- Use `*.d.ts` for shared type declarations (for example `src/lib/data/dataTypes.d.ts`).

## Testing Guidelines

No automated test framework is configured yet. Treat `npm run build` as the primary verification step: it catches type errors, and the production build must succeed before merge. If tests are added, place them next to the code they cover and use `*.test.ts` / `*.spec.ts` naming.

## Commit & Pull Request Guidelines

Commit messages follow Conventional Commits:

```
feat: 添加settingsManager生命周期
fix: 修复头像数据类型
docs: 更新DataControlHooks接口注释
```

Use only standard types such as `feat`, `fix`, `docs`, `chore`, `refactor`, `perf`, `test`, `build`, `ci`, and `revert`. Earlier history contains `optimize:` commits, but that prefix is non-standard and must not be used. Keep descriptions concise, and reference tracked issue numbers when relevant (for example `feat ts#17 更新App`).

Open PRs against `dev` with a clear description of the change and its motivation. Link related issues, attach screenshots for visual or UI changes, and confirm `npm run lint` and `npm run build` pass locally. CI builds and publishes `dev` and `main` automatically; never include server credentials in source files.
