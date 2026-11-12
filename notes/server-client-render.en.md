# How a page gets on screen

Opening a page has four separate steps. The user can already see the content after step 2. When JavaScript arrives, it does not fill data into the page.

This project uses Next.js 14 (`next dev` / `next build` / `next start`).

## 1. React render on the server

The browser requests `/` or `/account`. The server runs `app/page.tsx` (or `app/account/page.tsx`) and wraps it with `app/layout.tsx`.

These files have no `'use client'` and no `'use server'`. They are Server Components. The function can `await` a Supabase query. `return (<div>...)` produces React elements. There is no DOM yet.

React turns that element tree into two things and puts both in the same HTTP response:

- HTML. Fetched names and prices are already written into tags, for example `<button>Pro</button>`.
- An RSC payload, a description of the tree. If the tree contains a Client Component, the payload records which component it is and what its props are. Props must be serializable.

`'use server'` does not paint the page. Functions in `utils/stripe/server.ts` and `utils/auth-helpers/server.ts` return data or a redirect path.

`route.ts` does not paint a page either. It returns a `Response` for an HTTP method. `app/api/webhooks/route.ts` answers `POST`. `app/auth/callback/route.ts` redirects.

## 2. The browser paints the page

The browser parses the HTML, builds the DOM, and paints the buttons and text.

The user can already see "Pro". This step is the browser painting. The JavaScript bundles have not run yet.

## 3. JavaScript arrives and attaches to the DOM

"JavaScript arrives" means: the browser finishes downloading the script files and then executes them.

### Where the files come from

The code is compiled ahead of time, then downloaded by the browser from the Next.js server.

- `next build` writes static files under `.next/static/chunks/`. A production server (`next start`, or the host in front of it) serves them at URLs like `/_next/static/chunks/<hash>.js`.
- `next dev` compiles a chunk when it is first requested and serves it from the same dev server. The direction is the same: browser downloads from the Next server.

The HTML response from step 1 contains `<script src="/_next/static/chunks/...js">` tags. Parsing the HTML makes the browser send a separate `GET` for each of those URLs. Those requests are for JavaScript files. They are not another render of `page.tsx`, and they do not query Supabase.

What is inside the chunks:

- The React runtime.
- Client Component code, every file marked `'use client'` and the modules it imports.
- The Next.js client router.
- Small stubs for `'use server'` functions (an id the browser can call). The function body stays on the server.

`page.tsx` and `layout.tsx` are not in these files. Their output is already the HTML from step 1.

### What "arrives" does

React matches the DOM nodes already on screen to `Pricing` and attaches `onClick`. The picture does not change. `getProducts` does not run again.

```tsx
// app/page.tsx — runs only on the server; products are loaded once here
export default async function PricingPage() {
  const products = await getProducts(supabase);
  return (
    <div>
      <Pricing products={products} />
    </div>
  );
}

// Pricing.tsx
'use client';

export function Pricing({ products }) {
  return (
    <button onClick={() => alert(products[0].name)}>Choose</button>
  );
}
```

The server also rendered `Pricing` into the HTML, so the button is visible before the script runs. After the script runs, the attached piece is this `onClick`. The click reads the `products` array that came down with the page.

`onChange` and `useState` use that same in-memory array. Filtering the list in an input does not call `getProducts` again.

### When the browser downloads JavaScript

| What the user does | What is downloaded |
|---|---|
| First visit, refresh, or a normal link that loads a new document | The HTML document, then every `/_next/static/chunks/...js` file that document points at and that is not already in the browser cache. Shared chunks (React, the framework) and the chunks for Client Components on this page. |
| The same chunks on a later visit | Often nothing. Chunk filenames include a content hash. An unchanged file is reused from the browser cache until a new deploy changes the hash. |
| Click a Next.js `<Link>` or call `router.push` | The document stays. JavaScript already in memory keeps running. The browser requests the next route's RSC payload (a data request, not the page's HTML). It downloads an extra chunk only if the next page needs a Client Component that is not loaded yet. |
| `onClick`, `onChange`, `useState` | No download. The function is already in memory and uses props already received. |
| Call a `'use server'` function such as `checkoutWithStripe` | A `POST` with the action id and arguments. This is not a script download. The server may answer with a new RSC payload. The browser's React applies that payload to the existing DOM. |

## 4. A later React render in the browser

A click or keystroke changes state. React runs `Pricing` again in the browser and updates the DOM. That is the client React render.

That click contacts the server only when the handler calls a `'use server'` function. The server runs the function, re-runs the Server Components if the page must update, and returns a new RSC payload.

## Names

| Name | Which step |
|---|---|
| Page render | Step 2. The browser paints the HTML produced in step 1. |
| React render on the server | Step 1. `page.tsx` + `layout.tsx` produce HTML. |
| JavaScript arrives | Step 3. The browser has downloaded `/_next/static/chunks/...js` from the Next server and React has attached events. No data is filled in. |
| React render on the client | Step 4. A Client Component runs again after an interaction. |
