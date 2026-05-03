# TimeLens

TimeLens is a React + TypeScript + Vite app for date calculations across calendar systems.

## Run Locally

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

Build for production:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

## GitHub Pages Deployment

This repo is configured for GitHub Pages project hosting at:

```text
https://bydilip.github.io/time-lens/
```

Vite uses `base: "/time-lens/"` so built assets resolve correctly from the repository subpath.

Deployment is handled by `.github/workflows/deploy-pages.yml`. On pushes to `main`, GitHub Actions:

1. Installs dependencies with `npm ci`.
2. Builds the app with `npm run build`.
3. Uploads the `dist` folder as a Pages artifact.
4. Deploys the artifact to GitHub Pages.

Before the deployment workflow can publish, enable Pages in the repository:

1. Open `Settings` -> `Pages`.
2. Under `Build and deployment`, set `Source` to `GitHub Actions`.
3. Save the setting, then rerun the Pages workflow or push to `main`.
