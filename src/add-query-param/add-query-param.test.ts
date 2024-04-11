import { describe, expect, it } from 'vitest';
import addQueryParam from './add-query-param';
import { remark } from 'remark';

const queryParam = 'ref=myawesomewebsite.com';

describe('addQueryParam', () => {
	describe('Validations', () => {
		it('should throw an error if queryParam is not provided', async () => {
			await expect(async () => {
				await remark().use(addQueryParam, { queryParam: '' }).process('');
			}).rejects.toThrow('[remark-add-query-param] queryParam is required');
		});

		it('should throw an error if queryParam format is incorrect', async () => {
			await expect(async () => {
				await remark()
					.use(addQueryParam, { queryParam: 'invalidformat' })
					.process('');
			}).rejects.toThrow(
				'[remark-add-query-param] queryParam should be in the format key=value',
			);
		});
	});

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
				.process('[Google](https://www.google.com)');

			expect(String(result).trim().replace(/\\/g, '')).toEqual(
				`[Google](https://www.google.com/?${queryParam})`,
			);
		});

		it('should not add query parameter to external link with same ref', async () => {
			const result = await remark()
				.use(addQueryParam, { queryParam })
				.process('[Google](https://www.google.com?ref=oldwebsite.com)');

			expect(String(result).trim().replace(/\\/g, '')).toEqual(
				'[Google](https://www.google.com?ref=oldwebsite.com)',
			);
		});

		it('should add query parameter to external link with different ref', async () => {
			const result = await remark()
				.use(addQueryParam, { queryParam })
				.process('[Google](https://www.google.com?utm_source=oldwebsite.com)');

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

		it('should not add query parameter to internal link with hash', async () => {
			const result = await remark()
				.use(addQueryParam, { queryParam })
				.process('[Home](#section)');

			expect(String(result).trim().replace(/\\/g, '')).toEqual(
				'[Home](#section)',
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
	});
});
