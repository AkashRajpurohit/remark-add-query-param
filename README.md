<h1 align="center" style="border-bottom: none;">remark-add-query-param</h1>
<h3 align="center">A remark plugin to add query parameters to links</h3>
<br />
<p align="center">
  <a href="https://github.com/AkashRajpurohit/remark-add-query-param/actions/workflows/release.yml">
    <img alt="Build states" src="https://github.com/AkashRajpurohit/remark-add-query-param/actions/workflows/release.yml/badge.svg?branch=main">
  </a>
  <a href="https://www.npmjs.com/package/remark-add-query-param">
    <img alt="npm latest version" src="https://img.shields.io/npm/v/remark-add-query-param/latest.svg">
  </a>
  <a href="https://www.npmjs.com/package/remark-add-query-param">
    <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/min/remark-add-query-param">
  </a>
  <img alt="Visitors count" src="https://visitor-badge.laobi.icu/badge?page_id=@akashrajpurohit~remark-add-query-param.visitor-badge&style=flat-square&color=0088cc">
  <a href="https://www.npmjs.com/package/remark-add-query-param">
    <img alt="NPM license" src="https://img.shields.io/npm/l/remark-add-query-param">
  </a>
  <a href="https://twitter.com/akashwhocodes">
    <img alt="follow on twitter" src="https://img.shields.io/twitter/follow/akashwhocodes.svg?style=social&label=@akashwhocodes">
  </a>

  <p align="center">
    <a href="https://github.com/AkashRajpurohit/remark-add-query-param/issues/new?template=bug_report.yml">Bug report</a>
    ·
    <a href="https://github.com/AkashRajpurohit/remark-add-query-param/issues/new?template=feature_request.yml">Feature request</a>
  </p>
</p>
<br />
<hr />

## Why? 🤔

I use markdown to write my blog posts and I wanted to add query parameters to all the links in my blog posts. I couldn't find any plugin that does this so I decided to write one myself. This plugin adds query parameters to all the links in the markdown file.

So if you have a markdown file like this:

```markdown
This is a [link](https://example.com)
```

And you use this plugin with the query parameter `utm_source=remark-add-query-param`, the output will be:

```markdown
This is a [link](https://example.com?utm_source=remark-add-query-param)
```

## Usage 💻

First you need to install the package using npm or yarn or pnpm. 

```bash
npm install remark-add-query-param
```

Then you can use it in your remark pipeline like this:

```javascript
import { remark } from 'remark';
import addQueryParam from 'remark-add-query-param';

const processor = remark().use(addQueryParam, {
  queryParam: 'utm_source=remark-add-query-param',
  externalLinks: true,
  internalLinks: true,
});

processor.process('This is a [link](https://example.com)').then((file) => {
  console.log(String(file));
});
```

### Integration with Astro

If you are using Astro, you can use this plugin in your `astro.config.mjs` file like this:

```javascript
import { defineConfig } from 'astro/config';
import addQueryParam from 'remark-add-query-param';

export default defineConfig({
  markdown: {
    remark: {
      plugins: [
        [
          addQueryParam,
          {
            queryParam: 'utm_source=remark-add-query-param',
            externalLinks: true,
            internalLinks: true,
          },
        ],
      ],
    },
  }
});
```

### Integration with Next.js

If you are using Next.js, you can use this plugin in your `next.config.js` file like this:

```javascript
import addQueryParam from 'remark-add-query-param';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
};

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      [
        addQueryParam,
        {
          queryParam: 'utm_source=remark-add-query-param',
          externalLinks: true,
          internalLinks: true,
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
```

## Configurations ⚙️

You can pass the following options to the plugin:

- **queryParam**: The query parameter to add to the links. This is required and should be a valid query parameter string i.e `key=value`.
- **externalLinks**: If set to `false`, the plugin will not add the query parameter to external links. Default is `true` i.e it will add the query parameter to all external links.
- **internalLinks**: If set to `false`, the plugin will not add the query parameter to internal links. Default is `true` i.e it will add the query parameter to all internal links.

## Contributing 🫱🏻‍🫲🏼

Follow the [contribution guidelines](./CONTRIBUTING.md) to contribute to this project.

## Bugs or Requests 🐛

If you encounter any problems feel free to open an [issue](https://github.com/AkashRajpurohit/remark-add-query-param/issues/new?template=bug_report.yml). If you feel the project is missing a feature, please raise a [ticket](https://github.com/AkashRajpurohit/remark-add-query-param/issues/new?template=feature_request.yml) on GitHub and I'll look into it. Pull requests are also welcome.

## Where to find me? 👀

[![Website Badge](https://img.shields.io/badge/-akashrajpurohit.com-3b5998?logo=google-chrome&logoColor=white)](https://akashrajpurohit.com/)
[![Twitter Badge](https://img.shields.io/badge/-@akashwhocodes-00acee?logo=Twitter&logoColor=white)](https://twitter.com/AkashWhoCodes)
[![Linkedin Badge](https://img.shields.io/badge/-@AkashRajpurohit-0e76a8?logo=Linkedin&logoColor=white)](https://linkedin.com/in/AkashRajpurohit)
[![Instagram Badge](https://img.shields.io/badge/-@akashwho.codes-e4405f?logo=Instagram&logoColor=white)](https://instagram.com/akashwho.codes/)
[![Telegram Badge](https://img.shields.io/badge/-@AkashRajpurohit-0088cc?logo=Telegram&logoColor=white)](https://t.me/AkashRajpurohit)
