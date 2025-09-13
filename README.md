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
  <a href="https://github.com/AkashRajpurohit/remark-add-query-param/actions">
    <img alt="Coverage" src="https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/AkashRajpurohit/aa48c0038fbf37218a45f01d5f1467a3/raw/remark-add-query-param.json">
  </a>
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

I use Markdown to write content on [my website](https://akashrajpurohit.com/?ref=remark-add-query-param-readme). I wanted to add query parameters to all the links in blog posts so that I can get insights into the traffic sources as well as help other people who are reading my blog posts to know where the link is coming from. I couldn't find any existing plugin that does this, so I created one.

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
  externalQueryParams: 'utm_source=remark-add-query-param',
  internalQueryParams: 'source=blog',
});

processor.process('This is a [link](https://example.com)').then((file) => {
  console.log(String(file)); // This is a [link](https://example.com?utm_source=remark-add-query-param)
});
```

The plugin also supports using multiple query parameters like this:

```javascript
import { remark } from 'remark';
import addQueryParam from 'remark-add-query-param';

const processor = remark().use(addQueryParam, {
  externalQueryParams: ['utm_source=remark-add-query-param', 'utm_medium=markdown'],
  internalQueryParams: ['source=blog', 'campaign=internal'],
});

processor.process('This is a [link](https://example.com)').then((file) => {
  console.log(String(file)); // This is a [link](https://example.com?utm_source=remark-add-query-param&utm_medium=markdown)
});
```

You can also add query parameters to only one type of link:

```javascript
// Only add to external links
const processor = remark().use(addQueryParam, {
  externalQueryParams: 'utm_source=remark-add-query-param',
});

// Only add to internal links  
const processor = remark().use(addQueryParam, {
  internalQueryParams: 'source=blog',
});
```

### Dynamic Parameters 🚀

You can also use **dynamic parameters** that are calculated based on the current file being processed. This is perfect for tracking which specific pages are generating traffic:

```javascript
import { remark } from 'remark';
import addQueryParam from 'remark-add-query-param';

const processor = remark().use(addQueryParam, {
  externalQueryParams: [
    'utm_source=akashrajpurohit.com',
    {
      key: 'utm_medium',
      dynamic: (context) => context.file.stem, // Returns filename without extension
    },
  ],
});

// For a file named "my-first-blog.mdx", this will add:
// utm_source=akashrajpurohit.com&utm_medium=my-first-blog
```

The dynamic function receives a context object with:
- `context.file` - The VFile object with file metadata
- `context.linkUrl` - The URL of the link being processed
- `context.linkTitle` - The title of the link (if present)

**Common VFile properties you can use:**
- `context.file.stem` - Filename without extension (e.g., `my-first-blog`)
- `context.file.basename` - Full filename (e.g., `my-first-blog.mdx`)
- `context.file.dirname` - Directory path (e.g., `blog`)
- `context.file.path` - Full file path

**More dynamic parameter examples:**

```javascript
// Track by directory/section
{
  key: 'section',
  dynamic: (context) => context.file.dirname || 'root'
}

// Track target domain for external links
{
  key: 'target_domain',
  dynamic: (context) => {
    try {
      return new URL(context.linkUrl).hostname;
    } catch {
      return 'unknown';
    }
  }
}

// Custom slug generation
{
  key: 'post_id',
  dynamic: (context) => context.file.stem.replace(/-/g, '_')
}

// Date-based tracking (if filename contains date)
{
  key: 'published',
  dynamic: (context) => {
    const match = context.file.basename.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : 'unknown';
  }
}
```

### Why Different Parameters for Different Link Types? 🎯

One of the key advantages of the new API is that you can now specify **different query parameters for internal and external links**. This is particularly useful for:

- **External Links**: Track traffic sources with UTM parameters (`utm_source=blog`, `utm_medium=markdown`)
- **Internal Links**: Track internal navigation with custom parameters (`source=blog`, `section=header`)

This allows you to get more granular analytics and better understand how users navigate through your content vs. where they go when they leave your site.

To ensure the typescript is happy, you can import the types from the package like this:

```typescript
import type { QueryParam, RemarkAddQueryParamOptions, DynamicQueryParam } from 'remark-add-query-param';

const options: RemarkAddQueryParamOptions = {
  externalQueryParams: 'utm_source=remark-add-query-param' as QueryParam,
  internalQueryParams: 'source=blog' as QueryParam,
};

// Or for multiple query parameters
const options: RemarkAddQueryParamOptions = {
  externalQueryParams: ['utm_source=remark-add-query-param', 'utm_medium=markdown'] as QueryParam[],
  internalQueryParams: ['source=blog', 'campaign=internal'] as QueryParam[],
};

// Or with dynamic parameters
const dynamicOptions: RemarkAddQueryParamOptions = {
  externalQueryParams: [
    'utm_source=akashrajpurohit.com',
    {
      key: 'utm_medium',
      dynamic: (context) => context.file.stem,
    } as DynamicQueryParam,
  ],
};
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
            externalQueryParams: 'utm_source=remark-add-query-param',
            internalQueryParams: 'source=blog',
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
          externalQueryParams: 'utm_source=remark-add-query-param',
          internalQueryParams: 'source=blog',
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
```

## Configurations ⚙️

You can pass the following options to the plugin:

| Option                  | Type                                             | Description                                                                                                                                   |
| ----------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **externalQueryParams** | `QueryParamOrDynamic` or `QueryParamOrDynamic[]` | Query parameters to add to external links (HTTP/HTTPS URLs). Can be static strings (`key=value`) or dynamic objects with functions. Optional. |
| **internalQueryParams** | `QueryParamOrDynamic` or `QueryParamOrDynamic[]` | Query parameters to add to internal links (relative URLs). Can be static strings (`key=value`) or dynamic objects with functions. Optional.   |

**Note:** At least one of `externalQueryParams` or `internalQueryParams` must be provided.

### Link Types

- **External Links**: HTTP/HTTPS URLs (e.g., `https://example.com`, `http://example.com`)
- **Internal Links**: Relative URLs (e.g., `/about`, `./page`, `../other-page`)

The plugin will automatically detect the link type and apply the appropriate query parameters.

## Migration from v1.x to v2.x 🚀

Version 2.0.0 introduces a breaking change with a new, more intuitive API. Here's how to migrate:

### Before (v1.x)
```javascript
// Old API
addQueryParam({
  queryParam: 'utm_source=mywebsite',
  externalLinks: true,
  internalLinks: true,
});
```

### After (v2.x)
```javascript
// New API - much clearer!
addQueryParam({
  externalQueryParams: 'utm_source=mywebsite',
  internalQueryParams: 'source=blog',
});
```

### Key Changes:
- `queryParam` → `externalQueryParams` and `internalQueryParams`
- `externalLinks: boolean` → `externalQueryParams: string | string[]`
- `internalLinks: boolean` → `internalQueryParams: string | string[]`
- You can now specify different query parameters for external vs internal links
- At least one of the two options must be provided

## Contributing 🫱🏻‍🫲🏼

Follow the [contribution guidelines](./CONTRIBUTING.md) to contribute to this project.

## Bugs or Requests 🐛

If you encounter any problems feel free to open an [issue](https://github.com/AkashRajpurohit/remark-add-query-param/issues/new?template=bug_report.yml). If you feel the project is missing a feature, please raise a [ticket](https://github.com/AkashRajpurohit/remark-add-query-param/issues/new?template=feature_request.yml) on GitHub and I'll look into it. Pull requests are also welcome.

## Where to find me? 👀

[![Website Badge](https://img.shields.io/badge/-akashrajpurohit.com-3b5998?logo=google-chrome&logoColor=white)](https://akashrajpurohit.com/?utm_source=github&utm_medium=remark-add-query-param)
[![Twitter Badge](https://img.shields.io/badge/-@akashwhocodes-00acee?logo=Twitter&logoColor=white)](https://twitter.com/AkashWhoCodes)
[![Linkedin Badge](https://img.shields.io/badge/-@AkashRajpurohit-0e76a8?logo=Linkedin&logoColor=white)](https://linkedin.com/in/AkashRajpurohit)
[![Instagram Badge](https://img.shields.io/badge/-@akashwho.codes-e4405f?logo=Instagram&logoColor=white)](https://instagram.com/akashwho.codes/)
[![Telegram Badge](https://img.shields.io/badge/-@AkashRajpurohit-0088cc?logo=Telegram&logoColor=white)](https://t.me/AkashRajpurohit)
