import type { VFile } from 'vfile';

export type QueryParam = `${string}=${string}`;

export interface DynamicContext {
  /**
   * The VFile object containing file metadata
   */
  file: VFile;
  /**
   * The URL of the link being processed
   */
  linkUrl: string;
  /**
   * The title of the link being processed (if present)
   */
  linkTitle?: string;
}

export interface DynamicQueryParam {
  /**
   * The query parameter key
   */
  key: string;
  /**
   * Function that returns the dynamic value based on context
   */
  dynamic: (context: DynamicContext) => string;
}

export type QueryParamOrDynamic = QueryParam | DynamicQueryParam;

export interface RemarkAddQueryParamOptions {
  /**
   * Query parameters to add to external links (HTTP/HTTPS URLs)
   */
  externalQueryParams?: QueryParamOrDynamic | QueryParamOrDynamic[];
  /**
   * Query parameters to add to internal links (relative URLs)
   */
  internalQueryParams?: QueryParamOrDynamic | QueryParamOrDynamic[];
}
