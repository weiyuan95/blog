import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkStringify from 'rehype-stringify';
import rehypePrettyCode from 'rehype-pretty-code';

export default async function markdownToHtml(markdown: string) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(remarkStringify)
    .use(rehypePrettyCode, {
      theme: 'github-light',
    })
    .process(markdown);
  return result.toString();
}
