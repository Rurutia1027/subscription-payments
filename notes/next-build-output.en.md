# Where the compiled JavaScript goes

The JavaScript the browser downloads is this project's TypeScript, compiled and bundled. Next.js does not write it to a `dist/` folder. `next build` writes the output to `.next/`.

## What the browser downloads

The browser downloads the files in `.next/static/chunks/`. The HTML points at them with tags like:

```html
<script src="/_next/static/chunks/....js"></script>
```

Next compiles with SWC and bundles many `.ts` and `.tsx` files into each chunk. One chunk holds React, the `'use client'` components, and the modules those components import. The build does not emit one `.js` file for each source file.

`next dev` compiles a chunk when the browser first requests it and serves it from the same dev server. The files still come from the Next server, at the same `/_next/static/chunks/` URLs.

## What stays on the server

Code that runs only on the server is written to `.next/server/`. That includes `app/page.tsx`, `app/layout.tsx`, and `route.ts` files such as `app/api/webhooks/route.ts`.

Those files do not appear in `<script src="/_next/static/chunks/...">`. The browser does not download them.
