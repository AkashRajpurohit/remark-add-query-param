import { visit } from 'unist-util-visit';
import type { Node } from 'unist';
import type { Link } from 'mdast';
import type { RemarkAddQueryParamOptions } from './types';

const validateQueryParam = (queryParam: string) => {
	if (!queryParam.includes('=')) {
		throw new Error(
			`[remark-add-query-param] queryParam should be in the format key=value. Assertion failed for queryParam: ${queryParam}`,
		);
	}
};

/**
 * Add a query parameter to all links in the markdown
 * @param options Options for the plugin
 * @param options.queryParam The query parameter to add to the links. For example: 'ref=myawesomewebsite.com' or array of query parameters ['ref=myawesomewebsite.com', 'utm_source=twitter']
 * @param options.externalLinks Whether to add the query parameter to external links. Default is true
 * @param options.internalLinks Whether to add the query parameter to internal links. Default is true
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
			if (node.url?.startsWith('#')) {
				return;
			}

			if (node.url) {
				const isExternalUrl = node.url.startsWith('http');
				const isInternalUrl = node.url.startsWith('/');

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
					const parsedUrl = new URL(node.url);

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

					node.url = parsedUrl.toString();
				}

				// Handling for internal links
				if (isInternalUrl) {
					// Process for all query parameters
					for (const queryP of queryParam) {
						const [queryParamKey, queryParamValue] = queryP.split('=');

						// If the internal URL has a query parameter which matches the
						// same query parameter key, skip it
						if (node.url.includes(`${queryParamKey}=`)) {
							continue;
						}

						// If there are already some query parameters in the URL
						// Then append the query parameter to the URL
						if (node.url.includes('?')) {
							if (node.url.includes('#')) {
								// If the URL includes a hash, then add the query parameter before the hash
								node.url = `${
									node.url.split('#')[0]
								}&${queryParamKey}=${queryParamValue}#${
									node.url.split('#')[1]
								}`;
							} else {
								// Otherwise just append the query parameter to the URL
								node.url = `${node.url}&${queryParamKey}=${queryParamValue}`;
							}
						} else {
							if (node.url.includes('#')) {
								// If the URL includes a hash, then add the query parameter before the hash
								node.url = `${
									node.url.split('#')[0]
								}?${queryParamKey}=${queryParamValue}#${
									node.url.split('#')[1]
								}`;
							} else {
								// Otherwise just add the query parameter to the URL
								node.url = `${node.url}?${queryParamKey}=${queryParamValue}`;
							}
						}
					}
				}
			}
		});
	};
}
