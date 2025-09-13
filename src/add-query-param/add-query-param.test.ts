import { remark } from 'remark';
import { describe, expect, it } from 'vitest';
import addQueryParam from './add-query-param';
import type { QueryParam } from './types';

const externalQueryParam: QueryParam = 'ref=myawesomewebsite.com';
const internalQueryParam: QueryParam = 'source=blog';
const multiExternalQueryParams: QueryParam[] = [
  'ref=myawesomewebsite.com',
  'utm_source=twitter',
];
const multiInternalQueryParams: QueryParam[] = [
  'source=blog',
  'campaign=internal',
];

describe('addQueryParam', () => {
  describe('Validations', () => {
    it('should throw an error if neither externalQueryParams nor internalQueryParams are provided', async () => {
      await expect(async () => {
        // @ts-ignore - Testing invalid input
        await remark().use(addQueryParam, {}).process('');
      }).rejects.toThrow(
        '[remark-add-query-param] At least one of externalQueryParams or internalQueryParams must be provided',
      );
    });

    it('should throw an error if externalQueryParam format is incorrect', async () => {
      await expect(async () => {
        await remark()
          // @ts-ignore - Testing invalid input
          .use(addQueryParam, { externalQueryParams: 'invalidformat' })
          .process('');
      }).rejects.toThrow(
        '[remark-add-query-param] queryParam should be in the format key=value. Assertion failed for queryParam: invalidformat',
      );
    });

    it('should throw an error if internalQueryParam format is incorrect', async () => {
      await expect(async () => {
        await remark()
          // @ts-ignore - Testing invalid input
          .use(addQueryParam, { internalQueryParams: 'invalidformat' })
          .process('');
      }).rejects.toThrow(
        '[remark-add-query-param] queryParam should be in the format key=value. Assertion failed for queryParam: invalidformat',
      );
    });

    it('should throw error if any one of the externalQueryParams is not in the correct format', async () => {
      await expect(async () => {
        await remark()
          // @ts-ignore - Testing invalid input
          .use(addQueryParam, {
            externalQueryParams: [...multiExternalQueryParams, 'invalidformat'],
          })
          .process('');
      }).rejects.toThrow(
        '[remark-add-query-param] queryParam should be in the format key=value. Assertion failed for queryParam: invalidformat',
      );
    });

    it('should throw error if any one of the internalQueryParams is not in the correct format', async () => {
      await expect(async () => {
        await remark()
          // @ts-ignore - Testing invalid input
          .use(addQueryParam, {
            internalQueryParams: [...multiInternalQueryParams, 'invalidformat'],
          })
          .process('');
      }).rejects.toThrow(
        '[remark-add-query-param] queryParam should be in the format key=value. Assertion failed for queryParam: invalidformat',
      );
    });

    it('should throw error if queryParam has empty key', async () => {
      await expect(async () => {
        await remark()
          .use(addQueryParam, { externalQueryParams: '=test' })
          .process('');
      }).rejects.toThrow(
        '[remark-add-query-param] queryParam key cannot be empty. Assertion failed for queryParam: =test',
      );
    });

    it('should throw error if queryParam has empty value', async () => {
      await expect(async () => {
        await remark()
          .use(addQueryParam, { externalQueryParams: 'key=' })
          .process('');
      }).rejects.toThrow(
        '[remark-add-query-param] queryParam value cannot be empty. Assertion failed for queryParam: key=',
      );
    });

    it('should throw error if queryParam has only whitespace key', async () => {
      await expect(async () => {
        await remark()
          .use(addQueryParam, { externalQueryParams: ' =test' })
          .process('');
      }).rejects.toThrow(
        '[remark-add-query-param] queryParam key cannot be empty. Assertion failed for queryParam:  =test',
      );
    });

    it('should accept valid query parameters with equals signs in the value', async () => {
      const result = await remark()
        .use(addQueryParam, { externalQueryParams: 'filter=price=100' })
        .process('[Google](https://www.google.com/)');

      expect(String(result).trim().replace(/\\/g, '')).toEqual(
        '[Google](https://www.google.com/?filter=price%3D100)',
      );
    });
  });

  describe('External Links Only', () => {
    describe('Single Query Parameter', () => {
      it('should add query parameter to external link without existing params', async () => {
        const result = await remark()
          .use(addQueryParam, { externalQueryParams: externalQueryParam })
          .process('[Google](https://www.google.com/)');

        expect(String(result).trim().replace(/\\/g, '')).toEqual(
          `[Google](https://www.google.com/?${externalQueryParam})`,
        );
      });

      it('should not add query parameter to external link with same param key', async () => {
        const result = await remark()
          .use(addQueryParam, { externalQueryParams: externalQueryParam })
          .process('[Google](https://www.google.com/?ref=oldwebsite.com)');

        expect(String(result).trim().replace(/\\/g, '')).toEqual(
          '[Google](https://www.google.com/?ref=oldwebsite.com)',
        );
      });

      it('should add query parameter to external link with different params', async () => {
        const result = await remark()
          .use(addQueryParam, { externalQueryParams: externalQueryParam })
          .process(
            '[Google](https://www.google.com/?utm_source=oldwebsite.com)',
          );

        expect(String(result).trim().replace(/\\/g, '')).toEqual(
          `[Google](https://www.google.com/?utm_source=oldwebsite.com&${externalQueryParam})`,
        );
      });

      it('should not modify internal links when only externalQueryParams is provided', async () => {
        const result = await remark()
          .use(addQueryParam, { externalQueryParams: externalQueryParam })
          .process('[Home](/)');

        expect(String(result).trim().replace(/\\/g, '')).toEqual('[Home](/)');
      });
    });

    describe('Multiple Query Parameters', () => {
      const queryParamJoined = multiExternalQueryParams.join('&');
      const queryParamJoinedWithoutRefParam = multiExternalQueryParams
        .filter((queryParam) => !queryParam.includes('ref='))
        .join('&');

      it('should add multiple query parameters to external link without existing params', async () => {
        const result = await remark()
          .use(addQueryParam, { externalQueryParams: multiExternalQueryParams })
          .process('[Google](https://www.google.com/)');

        expect(String(result).trim().replace(/\\/g, '')).toEqual(
          `[Google](https://www.google.com/?${queryParamJoined})`,
        );
      });

      it('should not add duplicate query parameters to external link', async () => {
        const result = await remark()
          .use(addQueryParam, { externalQueryParams: multiExternalQueryParams })
          .process('[Google](https://www.google.com/?ref=oldwebsite.com)');

        expect(String(result).trim().replace(/\\/g, '')).toEqual(
          `[Google](https://www.google.com/?ref=oldwebsite.com&${queryParamJoinedWithoutRefParam})`,
        );
      });
    });
  });

  describe('Internal Links Only', () => {
    describe('Single Query Parameter', () => {
      it('should add query parameter to internal link without existing params', async () => {
        const result = await remark()
          .use(addQueryParam, { internalQueryParams: internalQueryParam })
          .process('[Home](/)');

        expect(String(result).trim().replace(/\\/g, '')).toEqual(
          `[Home](/?${internalQueryParam})`,
        );
      });

      it('should not add query parameter to internal link with same param key', async () => {
        const result = await remark()
          .use(addQueryParam, { internalQueryParams: internalQueryParam })
          .process('[Home](/?source=oldblog)');

        expect(String(result).trim().replace(/\\/g, '')).toEqual(
          '[Home](/?source=oldblog)',
        );
      });

      it('should add query parameter to internal link with different params', async () => {
        const result = await remark()
          .use(addQueryParam, { internalQueryParams: internalQueryParam })
          .process('[Home](/?utm_source=oldwebsite.com)');

        expect(String(result).trim().replace(/\\/g, '')).toEqual(
          `[Home](/?utm_source=oldwebsite.com&${internalQueryParam})`,
        );
      });

      it('should add query parameter to internal link with path and hash', async () => {
        const result = await remark()
          .use(addQueryParam, { internalQueryParams: internalQueryParam })
          .process('[Home](/blog/my-blog/#section)');

        expect(String(result).trim().replace(/\\/g, '')).toEqual(
          `[Home](/blog/my-blog/?${internalQueryParam}#section)`,
        );
      });

      it('should not modify external links when only internalQueryParams is provided', async () => {
        const result = await remark()
          .use(addQueryParam, { internalQueryParams: internalQueryParam })
          .process('[Google](https://www.google.com/)');

        expect(String(result).trim().replace(/\\/g, '')).toEqual(
          '[Google](https://www.google.com/)',
        );
      });

      it('should not add query parameter to internal link with just a hash', async () => {
        const result = await remark()
          .use(addQueryParam, { internalQueryParams: internalQueryParam })
          .process('[Home](#section)');

        expect(String(result).trim().replace(/\\/g, '')).toEqual(
          '[Home](#section)',
        );
      });
    });

    describe('Multiple Query Parameters', () => {
      const queryParamJoined = multiInternalQueryParams.join('&');
      const queryParamJoinedWithoutSourceParam = multiInternalQueryParams
        .filter((queryParam) => !queryParam.includes('source='))
        .join('&');

      it('should add multiple query parameters to internal link without existing params', async () => {
        const result = await remark()
          .use(addQueryParam, { internalQueryParams: multiInternalQueryParams })
          .process('[Home](/)');

        expect(String(result).trim().replace(/\\/g, '')).toEqual(
          `[Home](/?${queryParamJoined})`,
        );
      });

      it('should not add duplicate query parameters to internal link', async () => {
        const result = await remark()
          .use(addQueryParam, { internalQueryParams: multiInternalQueryParams })
          .process('[Home](/?source=oldblog)');

        expect(String(result).trim().replace(/\\/g, '')).toEqual(
          `[Home](/?source=oldblog&${queryParamJoinedWithoutSourceParam})`,
        );
      });
    });
  });

  describe('Both External and Internal Links', () => {
    it('should add different query parameters to external and internal links', async () => {
      const result = await remark().use(addQueryParam, {
        externalQueryParams: externalQueryParam,
        internalQueryParams: internalQueryParam,
      }).process(`
[Google](https://www.google.com/)
[Home](/)
				`);

      const expected = `
[Google](https://www.google.com/?${externalQueryParam})
[Home](/?${internalQueryParam})
			`.trim();

      expect(String(result).trim().replace(/\\/g, '')).toEqual(expected);
    });

    it('should add multiple different query parameters to external and internal links', async () => {
      const result = await remark().use(addQueryParam, {
        externalQueryParams: multiExternalQueryParams,
        internalQueryParams: multiInternalQueryParams,
      }).process(`
[Google](https://www.google.com/)
[Home](/)
				`);

      const expected = `
[Google](https://www.google.com/?${multiExternalQueryParams.join('&')})
[Home](/?${multiInternalQueryParams.join('&')})
			`.trim();

      expect(String(result).trim().replace(/\\/g, '')).toEqual(expected);
    });
  });

  describe('Edge Cases', () => {
    it('should return the same content when markdown has no links', async () => {
      const markdownContent = `
# This is a heading

This is a paragraph with **bold text** and *italic text*.

* List item 1
* List item 2

\`\`\`javascript
console.log('code block');
\`\`\`
       `;

      const result = await remark()
        .use(addQueryParam, {
          externalQueryParams: externalQueryParam,
          internalQueryParams: internalQueryParam,
        })
        .process(markdownContent);

      expect(String(result).trim()).toEqual(markdownContent.trim());
    });

    it('should return the same content when markdown has links with no URLs', async () => {
      const markdownContent = `
# This is a heading

This is a paragraph with [a link]() and [another link]().

* [List link]()
* [Another list link]()
       `;

      const result = await remark()
        .use(addQueryParam, {
          externalQueryParams: externalQueryParam,
          internalQueryParams: internalQueryParam,
        })
        .process(markdownContent);

      expect(String(result).trim()).toEqual(markdownContent.trim());
    });
  });

  describe('Non HTTP links', () => {
    it('should not add query parameter to mailto links', async () => {
      const result = await remark()
        .use(addQueryParam, {
          externalQueryParams: multiExternalQueryParams,
          internalQueryParams: multiInternalQueryParams,
        })
        .process('[Email](mailto:test@example.com)');

      expect(String(result).trim().replace(/\\/g, '')).toEqual(
        '[Email](mailto:test@example.com)',
      );
    });

    it('should not add query parameter to tel links', async () => {
      const result = await remark()
        .use(addQueryParam, {
          externalQueryParams: multiExternalQueryParams,
          internalQueryParams: multiInternalQueryParams,
        })
        .process('[Phone](tel:+1234567890)');

      expect(String(result).trim().replace(/\\/g, '')).toEqual(
        '[Phone](tel:+1234567890)',
      );
    });

    it('should not add query parameter to ftp links', async () => {
      const result = await remark()
        .use(addQueryParam, {
          externalQueryParams: multiExternalQueryParams,
          internalQueryParams: multiInternalQueryParams,
        })
        .process('[FTP](ftp://example.com/file.txt)');

      expect(String(result).trim().replace(/\\/g, '')).toEqual(
        '[FTP](ftp://example.com/file.txt)',
      );
    });

    it('should not add query parameter to file links', async () => {
      const result = await remark()
        .use(addQueryParam, {
          externalQueryParams: multiExternalQueryParams,
          internalQueryParams: multiInternalQueryParams,
        })
        .process('[File](file:///path/to/file.txt)');

      expect(String(result).trim().replace(/\\/g, '')).toEqual(
        '[File](file:///path/to/file.txt)',
      );
    });

    it('should not add query parameter to data URLs', async () => {
      const result = await remark()
        .use(addQueryParam, {
          externalQueryParams: multiExternalQueryParams,
          internalQueryParams: multiInternalQueryParams,
        })
        .process('[Data](data:text/plain;base64,SGVsbG8=)');

      expect(String(result).trim().replace(/\\/g, '')).toEqual(
        '[Data](data:text/plain;base64,SGVsbG8=)',
      );
    });
  });
});
