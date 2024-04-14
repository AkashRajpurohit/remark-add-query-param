export type QueryParam = `${string}=${string}`;

export interface RemarkAddQueryParamOptions {
	externalLinks?: boolean;
	internalLinks?: boolean;
	queryParam: QueryParam | QueryParam[];
}
