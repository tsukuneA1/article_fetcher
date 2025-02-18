import rss from '@astrojs/rss'
import { getAllPosts } from '../libs/micro';
import type { Post } from '../libs/interfaces';

export async function GET() {
  const posts: Post[] = await getAllPosts();
  console.log(`feed method called ${posts}`);

  return rss({
    title: 'posts',
    description: 'posts data',
    site: import.meta.env.SITE,
    items: posts.map((post) => ({
      link: post.Link,
      title: post.Title,
      description: post.Excerpt,
      pubDate: new Date(post.Date),
      tags: post.Tags,
    })),
  })
}