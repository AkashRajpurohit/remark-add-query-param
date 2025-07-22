import type { Link } from 'mdast';
import type { Node } from 'unist';
import { visit } from 'unist-util-visit';
import type { RemarkAddQueryParamOptions } from './types';

const validateQueryParam = (queryParam: string) => {
	if (!queryParam.includes('=')) {
		throw new Error(
			`[remark-add-query-param] queryParam should be in the format key=value. Assertion failed for queryParam: ${queryParam}`,
		);
	}
};

/**
 * Add a query parameter to HTTP/HTTPS and relative links in the markdown
 * @param options Options for the plugin
 * @param options.queryParam The query parameter to add to the links. For example: 'ref=myawesomewebsite.com' or array of query parameters ['ref=myawesomewebsite.com', 'utm_source=twitter']
 * @param options.externalLinks Whether to add the query parameter to external links. Default is true
 * @param options.internalLinks Whether to add the query parameter to internal links. Default is true
 *
 * Note: Only HTTP/HTTPS URLs and relative URLs are processed. Other URL schemes like mailto:, tel:, ftp:, etc. are left unchanged.
 */
export default function addQueryParam({
	queryParam,
	externalLinks = true,
	internalLinks = true,
}: RemarkAddQueryParamOptions) {
	if (!queryParam) {
		throw new Error('[remark-add-query-param] queryParam is required');
	}

	if (!Array.isArray(queryParam)) {
		queryParam = [queryParam];
	}

	for (const param of queryParam) {
		validateQueryParam(param);
	}

	return (tree: Node) => {
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

			// If the URL is external and externalLinks is false, skip it
			if (!externalLinks && isExternalUrl) {
				return;
			}

			// If the URL is internal and internalLinks is false, skip it
			if (!internalLinks && isInternalUrl) {
				return;
			}

			let parsedUrl: URL;

			if (isExternalUrl) {
				parsedUrl = new URL(node.url);
			} else {
				parsedUrl = new URL(node.url, 'https://example.com');
			}

			// Process for all query parameters
			for (const queryP of queryParam) {
				const [queryParamKey, queryParamValue] = queryP.split('=');

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
