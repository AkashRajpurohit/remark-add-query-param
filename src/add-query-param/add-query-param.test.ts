import { remark } from 'remark';
import { describe, expect, it } from 'vitest';
import addQueryParam from './add-query-param';
import type { QueryParam } from './types';

const queryParam: QueryParam = 'ref=myawesomewebsite.com';
const multiQueryParams: QueryParam[] = [
	'ref=myawesomewebsite.com',
	'via=twitter',
];

describe('addQueryParam', () => {
	describe('Validations', () => {
		it('should throw an error if queryParam is not provided', async () => {
			await expect(async () => {
				// @ts-ignore - Testing invalid input
				await remark().use(addQueryParam, { queryParam: '' }).process('');
			}).rejects.toThrow('[remark-add-query-param] queryParam is required');
		});

		it('should throw an error if queryParam format is incorrect', async () => {
			await expect(async () => {
				await remark()
					// @ts-ignore - Testing invalid input
					.use(addQueryParam, { queryParam: 'invalidformat' })
					.process('');
			}).rejects.toThrow(
				'[remark-add-query-param] queryParam should be in the format key=value. Assertion failed for queryParam: invalidformat',
			);
		});

		it('should throw error if any one of the queryParam is not in the correct format', async () => {
			await expect(async () => {
				await remark()
					// @ts-ignore - Testing invalid input
					.use(addQueryParam, {
						queryParam: [...multiQueryParams, 'invalidformat'],
					})
					.process('');
			}).rejects.toThrow(
				'[remark-add-query-param] queryParam should be in the format key=value. Assertion failed for queryParam: invalidformat',
			);
		});
	});

	describe('Single Query Parameter', () => {
		describe('External links', () => {
			it('should not add query parameter to external link if externalLinks is false', async () => {
				const result = await remark()
					.use(addQueryParam, { queryParam, externalLinks: false })
					.process('[Google](https://www.google.com)');

				expect(String(result).trim().replace(/\\/g, '')).toEqual(
					'[Google](https://www.google.com)',
				);
			});

			it('should add query parameter to external link without ref', async () => {
				const result = await remark()
					.use(addQueryParam, { queryParam })
					.process('[Google](https://www.google.com/)');

				expect(String(result).trim().replace(/\\/g, '')).toEqual(
					`[Google](https://www.google.com/?${queryParam})`,
				);
			});

			it('should not add query parameter to external link with same ref', async () => {
				const result = await remark()
					.use(addQueryParam, { queryParam })
					.process('[Google](https://www.google.com/?ref=oldwebsite.com)');

				expect(String(result).trim().replace(/\\/g, '')).toEqual(
					'[Google](https://www.google.com/?ref=oldwebsite.com)',
				);
			});

			it('should add query parameter to external link with different ref', async () => {
				const result = await remark()
					.use(addQueryParam, { queryParam })
					.process(
						'[Google](https://www.google.com/?utm_source=oldwebsite.com)',
					);

				expect(String(result).trim().replace(/\\/g, '')).toEqual(
					`[Google](https://www.google.com/?utm_source=oldwebsite.com&${queryParam})`,
				);
			});
		});

		describe('Internal links', () => {
			it('should not add query parameter to internal link if internalLinks is false', async () => {
				const result = await remark()
					.use(addQueryParam, { queryParam, internalLinks: false })
					.process('[Home](/)');

				expect(String(result).trim().replace(/\\/g, '')).toEqual('[Home](/)');
			});

			it('should not add query parameter to internal link with just a hash', async () => {
				const result = await remark()
					.use(addQueryParam, { queryParam })
					.process('[Home](#section)');

				expect(String(result).trim().replace(/\\/g, '')).toEqual(
					'[Home](#section)',
				);
			});

			it('should add query parameter to internal link with path and hash', async () => {
				const result = await remark()
					.use(addQueryParam, { queryParam })
					.process('[Home](/blog/my-blog/#section)');

				expect(String(result).trim().replace(/\\/g, '')).toEqual(
					`[Home](/blog/my-blog/?${queryParam}#section)`,
				);
			});

			it('should add query parameter to internal link without ref', async () => {
				const result = await remark()
					.use(addQueryParam, { queryParam })
					.process('[Home](/)');

				expect(String(result).trim().replace(/\\/g, '')).toEqual(
					`[Home](/?${queryParam})`,
				);
			});

			it('should not add query parameter to internal link with same ref', async () => {
				const result = await remark()
					.use(addQueryParam, { queryParam })
					.process('[Home](/?ref=oldwebsite.com)');

				expect(String(result).trim().replace(/\\/g, '')).toEqual(
					'[Home](/?ref=oldwebsite.com)',
				);
			});

			it('should add query parameter to internal link with different ref', async () => {
				const result = await remark()
					.use(addQueryParam, { queryParam })
					.process('[Home](/?utm_source=oldwebsite.com)');

				expect(String(result).trim().replace(/\\/g, '')).toEqual(
					`[Home](/?utm_source=oldwebsite.com&${queryParam})`,
				);
			});

			it('should add query parameter to internal link with different ref and hash', async () => {
				const result = await remark()
					.use(addQueryParam, { queryParam })
					.process('[Home](/?utm_source=oldwebsite.com#section)');

				expect(String(result).trim().replace(/\\/g, '')).toEqual(
					`[Home](/?utm_source=oldwebsite.com&${queryParam}#section)`,
				);
			});
		});
	});

	describe('Multiple Query Parameters', () => {
		const queryParamJoined = multiQueryParams.join('&');
		const queryParamJoinedWithoutRefParam = multiQueryParams
			.filter((queryParam) => !queryParam.includes('ref='))
			.join('&');

		describe('External links', () => {
			it('should not add query parameter to external link if externalLinks is false', async () => {
				const result = await remark()
					.use(addQueryParam, {
						queryParam: multiQueryParams,
						externalLinks: false,
					})
					.process('[Google](https://www.google.com)');

				expect(String(result).trim().replace(/\\/g, '')).toEqual(
					'[Google](https://www.google.com)',
				);
			});

			it('should add query parameter to external link without ref', async () => {
				const result = await remark()
					.use(addQueryParam, { queryParam: multiQueryParams })
					.process('[Google](https://www.google.com/)');

				expect(String(result).trim().replace(/\\/g, '')).toEqual(
					`[Google](https://www.google.com/?${queryParamJoined})`,
				);
			});

			it('should not add query parameter to external link with same ref', async () => {
				const result = await remark()
					.use(addQueryParam, { queryParam: multiQueryParams })
					.process('[Google](https://www.google.com/?ref=oldwebsite.com)');

				expect(String(result).trim().replace(/\\/g, '')).toEqual(
					`[Google](https://www.google.com/?ref=oldwebsite.com&${queryParamJoinedWithoutRefParam})`,
				);
			});

			it('should add query parameter to external link with different ref', async () => {
				const result = await remark()
					.use(addQueryParam, { queryParam: multiQueryParams })
					.process(
						'[Google](https://www.google.com/?utm_source=oldwebsite.com)',
					);

				expect(String(result).trim().replace(/\\/g, '')).toEqual(
					`[Google](https://www.google.com/?utm_source=oldwebsite.com&${queryParamJoined})`,
				);
			});
		});

		describe('Internal links', () => {
			it('should not add query parameter to internal link if internalLinks is false', async () => {
				const result = await remark()
					.use(addQueryParam, {
						queryParam: multiQueryParams,
						internalLinks: false,
					})
					.process('[Home](/)');

				expect(String(result).trim().replace(/\\/g, '')).toEqual('[Home](/)');
			});

			it('should not add query parameter to internal link with just a hash', async () => {
				const result = await remark()
					.use(addQueryParam, { queryParam: multiQueryParams })
					.process('[Home](#section)');

				expect(String(result).trim().replace(/\\/g, '')).toEqual(
					'[Home](#section)',
				);
			});

			it('should add query parameter to internal link with path and hash', async () => {
				const result = await remark()
					.use(addQueryParam, { queryParam: multiQueryParams })
					.process('[Home](/blog/my-blog/#section)');

				expect(String(result).trim().replace(/\\/g, '')).toEqual(
					`[Home](/blog/my-blog/?${queryParamJoined}#section)`,
				);
			});

			it('should add query parameter to internal link without ref', async () => {
				const result = await remark()
					.use(addQueryParam, { queryParam: multiQueryParams })
					.process('[Home](/)');

				expect(String(result).trim().replace(/\\/g, '')).toEqual(
					`[Home](/?${queryParamJoined})`,
				);
			});

			it('should not add query parameter to internal link with same ref', async () => {
				const result = await remark()
					.use(addQueryParam, { queryParam: multiQueryParams })
					.process('[Home](/?ref=oldwebsite.com)');

				expect(String(result).trim().replace(/\\/g, '')).toEqual(
					`[Home](/?ref=oldwebsite.com&${queryParamJoinedWithoutRefParam})`,
				);
			});

			it('should add query parameter to internal link with different ref', async () => {
				const result = await remark()
					.use(addQueryParam, { queryParam: multiQueryParams })
					.process('[Home](/?utm_source=oldwebsite.com)');

				expect(String(result).trim().replace(/\\/g, '')).toEqual(
					`[Home](/?utm_source=oldwebsite.com&${queryParamJoined})`,
				);
			});

			it('should add query parameter to internal link with different ref and hash', async () => {
				const result = await remark()
					.use(addQueryParam, { queryParam: multiQueryParams })
					.process('[Home](/?utm_source=oldwebsite.com#section)');

				expect(String(result).trim().replace(/\\/g, '')).toEqual(
					`[Home](/?utm_source=oldwebsite.com&${queryParamJoined}#section)`,
				);
			});
		});
	});
});
