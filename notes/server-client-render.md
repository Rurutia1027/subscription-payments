# 页面是怎么画出来的

一次打开页面，有四次不同的事。前两次用户就看见内容了，JavaScript 到达时不再往页面里填数据。

## 1. 服务器上的 React render

浏览器请求 `/` 或 `/account`。服务器执行 `app/page.tsx`（或 `app/account/page.tsx`），外面包上 `app/layout.tsx`。

这些文件没有 `'use client'`，也没有 `'use server'`。它们是 Server Component，只在服务器上执行。函数可以 `await` 查 Supabase。`return (<div>...)` 得到的是 React 元素，这时还没有 DOM。

React 在服务器上把这棵元素树变成两样东西，放进同一份响应：

- HTML。查询到的产品名、价格已经写进标签，例如 `<button>Pro</button>`。
- 一份界面描述（RSC payload）。如果树里有客户端组件，这里记下它是哪个组件、props 是什么。props 必须能序列化。

`'use server'` 不负责画页面。`utils/stripe/server.ts`、`utils/auth-helpers/server.ts` 里的函数返回数据或跳转地址。

`route.ts` 也不画页面。它按 HTTP 方法返回 `Response`，例如 `app/api/webhooks/route.ts` 的 `POST`，或 `app/auth/callback/route.ts` 的重定向。

## 2. 浏览器绘制页面

浏览器解析 HTML，建成 DOM，把按钮和文字画到屏幕上。

用户这时已经看见 "Pro"。这一步是浏览器在画，JavaScript 还没执行。

## 3. JavaScript 到达：接上已有的 DOM

「JavaScript 到达」是指：浏览器从 Next 服务器把脚本文件下载完，然后执行。

`next build` 把客户端代码编译成 `.next/static/chunks/<hash>.js`。页面 HTML 里有 `<script src="/_next/static/chunks/...js">`。浏览器解析 HTML 时，对每个地址再发一次 `GET`，把文件下载回来。`next dev` 也是开发服务器在被请求时编译并提供这些文件，方向同样是浏览器向 Next 服务器要。

这些文件里有 React、`'use client'` 组件、Next 的客户端路由，以及 `'use server'` 函数的调用存根。`page.tsx` 的函数体不在里面。这次下载不查 Supabase。

下载时机：

- 第一次打开、刷新、整页跳转：下载这份 HTML 点名的、且浏览器缓存里还没有的 chunk。
- 再次访问同一份 chunk：文件名带内容哈希，没改过就用缓存，不再下载。
- 点击 Next 的 `<Link>`：页面不重新加载，已在内存里的 JavaScript 继续用。浏览器只请求下一个路由的 RSC payload；只有下一个页面用到尚未加载的客户端组件时，才再下一个 chunk。
- `onClick`、`onChange`、`useState`：不下载。
- 调用 `checkoutWithStripe` 这种 `'use server'` 函数：发的是 `POST`，不是下载脚本。

React 把已经画好的 DOM 和客户端组件接上，挂上 `onClick`。画面不变，也不会再查一次数据库。

对应关系：

```tsx
// app/page.tsx：只在服务器执行，products 在这里查一次
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
    <button onClick={() => alert(products[0].name)}>选择</button>
  );
}
```

服务器会先把 `Pricing` 也渲进 HTML，所以按钮一开始就在页面上。JavaScript 到达后接上的是这个 `onClick`。点击时读的是当时传下来的 `products`。

`onChange`、`useState` 同样用浏览器里的这份数据。用输入框筛选已有的 `products`，不会再请求 `getProducts`。

## 4. 之后的客户端 React render

用户点击、输入，状态变了，React 才在浏览器里重新执行 `Pricing`，按新的结果改 DOM。这是客户端的 React render。

只有处理函数里又调用了 `'use server'` 函数（例如结账的 `checkoutWithStripe`），这次点击才会再发请求到服务器。服务器重新执行 Server Component 后，返回一份新的界面描述，浏览器里的 React 按它修改已有的 DOM。

## 名字对照

| 说法 | 实际是哪一步 |
|---|---|
| page render | 第 2 步。浏览器用第 1 步产出的 HTML 画页面 |
| 服务器上的 React render | 第 1 步。`page.tsx` + `layout.tsx` 生成 HTML |
| JavaScript 到达 | 第 3 步。接上 DOM、挂事件，不填数据 |
| 客户端的 React render | 第 4 步。交互之后才重新执行客户端组件 |
