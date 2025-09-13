import type { Link } from 'mdast';
import type { Node } from 'unist';
import { visit } from 'unist-util-visit';
import type { VFile } from 'vfile';
import type {
  RemarkAddQueryParamOptions,
  DynamicContext,
  QueryParamOrDynamic,
} from './types';

const validateQueryParam = (queryParam: string) => {
  if (!queryParam.includes('=')) {
    throw new Error(
      `[remark-add-query-param] queryParam should be in the format key=value. Assertion failed for queryParam: ${queryParam}`,
    );
  }

  const [key, ...valueParts] = queryParam.split('=');

  // Check if key is empty or contains invalid characters
  if (!key || key.trim() === '') {
    throw new Error(
      `[remark-add-query-param] queryParam key cannot be empty. Assertion failed for queryParam: ${queryParam}`,
    );
  }

  // Check if value is missing (e.g., "key=" without value)
  if (
    valueParts.length === 0 ||
    (valueParts.length === 1 && valueParts[0] === '')
  ) {
    throw new Error(
      `[remark-add-query-param] queryParam value cannot be empty. Assertion failed for queryParam: ${queryParam}`,
    );
  }
};

/**
 * Add query parameters to HTTP/HTTPS and relative links in the markdown
 * @param options Options for the plugin
 * @param options.externalQueryParams Query parameters to add to external links (HTTP/HTTPS URLs). Can be static strings like 'ref=myawesomewebsite.com' or dynamic objects with functions that receive file context.
 * @param options.internalQueryParams Query parameters to add to internal links (relative URLs). Can be static strings like 'ref=myawesomewebsite.com' or dynamic objects with functions that receive file context.
 *
 * Dynamic parameters example:
 * ```javascript
 * {
 *   key: 'utm_medium',
 *   dynamic: (context) => context.file.stem // Returns filename without extension
 * }
 * ```
 *
 * Note: Only HTTP/HTTPS URLs and relative URLs are processed. Other URL schemes like mailto:, tel:, ftp:, etc. are left unchanged.
 */
export default function addQueryParam({
  externalQueryParams: externalQueryParamsOption,
  internalQueryParams: internalQueryParamsOption,
}: RemarkAddQueryParamOptions) {
  if (!externalQueryParamsOption && !internalQueryParamsOption) {
    throw new Error(
      '[remark-add-query-param] At least one of externalQueryParams or internalQueryParams must be provided',
    );
  }

  const externalQueryParams = externalQueryParamsOption
    ? Array.isArray(externalQueryParamsOption)
      ? externalQueryParamsOption
      : [externalQueryParamsOption]
    : [];
  const internalQueryParams = internalQueryParamsOption
    ? Array.isArray(internalQueryParamsOption)
      ? internalQueryParamsOption
      : [internalQueryParamsOption]
    : [];

  // Helper function to process dynamic parameters
  const processDynamicParams = (
    params: QueryParamOrDynamic[],
    context: DynamicContext,
  ): string[] => {
    return params.map((param) => {
      if (typeof param === 'string') {
        return param;
      } else {
        // Dynamic parameter
        try {
          const value = param.dynamic(context);
          return `${param.key}=${value}`;
        } catch (error) {
          throw new Error(
            `[remark-add-query-param] Error in dynamic parameter function for key "${
              param.key
            }": ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    });
  };

  // Validate static parameters only (dynamic ones will be validated when processed)
  for (const param of [...externalQueryParams, ...internalQueryParams]) {
    if (typeof param === 'string') {
      validateQueryParam(param);
    }
  }

  return (tree: Node, file: VFile) => {
    visit(tree, 'link', (node: Link) => {
      if (!node.url) {
        return;
      }

      // Skip anchor links
      if (node.url.startsWith('#')) {
        return;
      }

      // Only process HTTP/HTTPS URLs and relative URLs
      // Skip other schemes like mailto:, tel:, ftp:, etc.
      const isHttpUrl =
        node.url.startsWith('http://') || node.url.startsWith('https://');
      const isRelativeUrl =
        node.url.startsWith('/') ||
        node.url.startsWith('./') ||
        node.url.startsWith('../');

      // Skip if it's not an HTTP URL or relative URL
      if (!isHttpUrl && !isRelativeUrl) {
        return;
      }

      const isExternalUrl = isHttpUrl;
      const isInternalUrl = isRelativeUrl;

      // Create context for dynamic parameters
      const context: DynamicContext = {
        file,
        linkUrl: node.url,
        linkTitle: node.title || undefined,
      };

      let queryParamsToUse: string[] = [];
      if (isExternalUrl && externalQueryParams.length > 0) {
        queryParamsToUse = processDynamicParams(externalQueryParams, context);
      } else if (isInternalUrl && internalQueryParams.length > 0) {
        queryParamsToUse = processDynamicParams(internalQueryParams, context);
      } else {
        // Skip if no query parameters are configured for this URL type
        return;
      }

      let parsedUrl: URL;

      if (isExternalUrl) {
        parsedUrl = new URL(node.url);
      } else {
        parsedUrl = new URL(node.url, 'https://example.com');
      }

      for (const queryP of queryParamsToUse) {
        const equalIndex = queryP.indexOf('=');
        const queryParamKey = queryP.substring(0, equalIndex);
        const queryParamValue = queryP.substring(equalIndex + 1);

        // If the URL already has a query parameter which matches the
        // same query parameter key, skip it
        if (parsedUrl.searchParams.get(queryParamKey)) {
          continue;
        }

        parsedUrl.searchParams.set(queryParamKey, queryParamValue);
      }

      if (isExternalUrl) {
        node.url = parsedUrl.toString();
      } else {
        node.url = parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
      }
    });
  };
}
