import { getAllPosts } from '@/lib/api';
import DateFormatter from '@/app/_components/date-formatter';
import Link from 'next/link';

export default function TableOfContents() {
  const allPosts = getAllPosts();

  return (
    <>
      <div>
        {allPosts.map((post) => (
          <div key={post.slug} className="py-2">
            {/*<div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-5 ">*/}
            <div className="flex">
              <DateFormatter className="w-[60px] md:w-auto pr-2" dateString={post.date} />
              <Link className="underline" href={`posts/${post.slug}`}>
                {post.title}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
