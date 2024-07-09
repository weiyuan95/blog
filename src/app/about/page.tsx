import Container from '@/app/_components/container';
import fs from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import markdownToHtml from '@/lib/markdownToHtml';
import markdownStyles from '@/app/_components/markdown-styles.module.css';

export default async function About() {
  const fileContent = fs.readFileSync(join(process.cwd(), 'src/app/about/me.md'), 'utf8');
  const { content } = matter(fileContent);
  const htmlContent = await markdownToHtml(content || '');

  return (
    <Container>
      <div className={markdownStyles['markdown']} dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </Container>
  );
}
