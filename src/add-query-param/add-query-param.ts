import { visit } from 'unist-util-visit';
import { toString as mdToString } from 'mdast-util-to-string';
import { parse } from 'node:url';
import type { Node } from 'unist';
import type { Link } from 'mdast';

interface Options {
	externalLinks?: boolean;
	internalLinks?: boolean;
	queryParam: string;
}

/**
 * Add a query parameter to all links in the markdown
 * @param options Options for the plugin
 * @param options.queryParam The query parameter to add to the links. For example: 'ref=myawesomewebsite.com'
 * @param options.externalLinks Whether to add the query parameter to external links. Default is true
 * @param options.internalLinks Whether to add the query parameter to internal links. Default is true
 */
export default function addQueryParam({
	queryParam,
	externalLinks = true,
	internalLinks = true,
}: Options) {
	console.log({ queryParam });
	if (!queryParam) {
		throw new Error('[remark-add-query-param] queryParam is required');
	}

	const [queryParamKey, queryParamValue] = queryParam.split('=');

	console.log({ queryParamKey, queryParamValue });

	if (!queryParamKey || !queryParamValue) {
		throw new Error(
			'[remark-add-query-param] queryParam should be in the format key=value',
		);
	}

	return (tree: Node) => {
		visit(tree, 'link', (node: Link) => {
			console.log(node.url);
			if (node.url?.startsWith('#')) {
				return;
			}

			const linkText = mdToString(node);
			if (linkText.startsWith('#')) {
				return;
			}

			if (node.url) {
				const isExternalUrl = node.url.startsWith('http');
				const isInternalUrl = node.url.startsWith('/');

				console.log({ isExternalUrl, isInternalUrl });

				// If the URL is external and externalLinks is false, skip it
				if (!externalLinks && isExternalUrl) {
					return;
				}

				// If the URL is internal and internalLinks is false, skip it
				if (!internalLinks && isInternalUrl) {
					return;
				}

				// Handling for external links
				if (isExternalUrl) {
					const parsedUrl = parse(node.url, true);

					console.log({ parsedUrl });

					// If the URL already has a query parameter which matches the
					// same query parameter key, skip it
					if (parsedUrl.query && parsedUrl.query[queryParamKey] !== undefined) {
						return;
					}

					// Append the query parameter to the URL
					const newUrl = new URL(node.url);
					newUrl.searchParams.set(queryParamKey, queryParamValue);

					console.log({ newUrl });

					node.url = newUrl.toString();
				}

				if (isInternalUrl) {
					// If the internal URL has a query parameter which matches the
					// same query parameter key, skip it
					if (node.url.includes(`${queryParamKey}=`)) {
						return;
					}

					// If there are already some query parameters in the URL
					// Then append the query parameter to the URL
					// Otherwise add the query parameter to the URL
					if (node.url.includes('?')) {
						node.url = `${node.url}&${queryParamKey}=${queryParamValue}`;
					} else {
						node.url = `${node.url}?${queryParamKey}=${queryParamValue}`;
					}
				}
			}
		});
	};
}
