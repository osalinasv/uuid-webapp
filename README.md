# UUID Tools

> A simple webtool for generating and converting UUIDv4

**See the tool live!**  
[https://uuid.osalinasv.dev/](https://uuid.osalinasv.dev/)

This project was built as a proof of concept for integrating
[HTMX](https://htmx.org/) and [Astro](https://astro.build/) for a
straightforward development stack using only JavaScript.

The purpose was to not use any front-end frameworks and avoid using custom
JavaScript and CSS files as much as possible. Why?

- Proving that apps can still be interactive without using a bloated framework
- Simplifying state management, by using HTML as the state itself
- Delegating rendering to the server to avoid unnecessary in-memory DOM
  representations
- Because its fun to try stuff

This project attempts to emulate some of [shadcnui's](https://ui.shadcn.com/)
components using only HTML and Hyperscript. While I would't necessarily
recommend doing this in an actual product, its a fun experiment.

## Build With

- **[Astro](https://astro.build/):** SSR and HTML templating
- **[HTMX](https://htmx.org/):** Swapping HTML request results
- **[Hyperscript](https://hyperscript.org/):** Defining component behavior in
  HTML
- **[Tailwind](https://tailwindcss.com/):** Styling with utility classes

For a list of all dependencies used check out [`package.json`](package.json)

## Getting Started

Install all dependencies with your favorite Node package manager.  
Make sure you have Node `v18.14.1` or later installed.

```sh
pnpm install
```

## Build & deploy

To start a development instance with Astro run the `dev` command:

```sh
pnpm dev
```

The live version at [https://uuid.osalinasv.dev/](https://uuid.osalinasv.dev/)
was deployed using Cloudflare's adapter for Astro. To build and deploy on
Cloudflare run the `build` command:

```sh
pnpm build
```

You can also check out
[Astro's various guides on SSR adapters](https://docs.astro.build/en/guides/server-side-rendering/)
if you want to deploy somewhere else.

