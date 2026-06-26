# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv create --template minimal --types ts --add prettier eslint tailwindcss="plugins:typography,forms" devtools-json --install yarn NyhedsNat
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Debug traffic mode (vehicles)

You can increase vehicle spawn rate for testing via `.env`:

```env
PUBLIC_DEBUG_TRAFFIC=true
PUBLIC_DEBUG_TRAFFIC_MULTIPLIER=10
```

- `PUBLIC_DEBUG_TRAFFIC`: `true` enables debug traffic, `false` disables it (only these values are supported)
- `PUBLIC_DEBUG_TRAFFIC_MULTIPLIER`: spawn-rate multiplier (e.g. `10` = 10x more frequent)

After changing `.env`, restart the dev server.

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
