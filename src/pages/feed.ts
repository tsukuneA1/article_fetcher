import rss from '@astrojs/rss'
import type { Post } from '../libs/interfaces';

export async function GET() {
  const siteUrl = import.meta.env.SITE_URL as string;

const response = await fetch(`${siteUrl}/api/posts`);
  const posts: Post[] = await response.json();

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