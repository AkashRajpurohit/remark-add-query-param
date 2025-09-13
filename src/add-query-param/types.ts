export type QueryParam = `${string}=${string}`;

export interface RemarkAddQueryParamOptions {
	/**
	 * Query parameters to add to external links (HTTP/HTTPS URLs)
	 */
	externalQueryParams?: QueryParam | QueryParam[];
	/**
	 * Query parameters to add to internal links (relative URLs)
	 */
	internalQueryParams?: QueryParam | QueryParam[];
}
