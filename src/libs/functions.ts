import { getTagLink } from "../components/PostTags.astro";
import type { Post, QiitaItemResponse, ZennPost } from "./interfaces";
import { postsPerPageNumber } from "./micro";

const BASE_PATH = '';

export const pathJoin = (path: string, subPath: string) => {
    return (
      '/' +
      path
        .split('/')
        .concat(subPath.split('/'))
        .filter((p) => p)
        .join('/')
    )
  }

export const convertQiitaToPost = (qiitaPost: QiitaItemResponse): Post => {
    return {
        Title: qiitaPost.title,
        Date: qiitaPost.created_at,
        Tags: qiitaPost.tags.map((tag) => tag.name),
        Excerpt: qiitaPost.body,
        Link: `${qiitaPost.url}`,
        ShowAuthor: false,
        Author: qiitaPost.user.name,

    };
};

export const convertZennToPost = (zennPost: ZennPost): Post => {
    return {
        Title: zennPost.title,
        Date: zennPost.published_at,
        Tags: [],
        Excerpt: '',
        Link: `https://zenn.dev/${zennPost.path}`,
        ShowAuthor: false,
        Author: zennPost.user.name,
    };
};

export const covertJSTToDate = (date: Date): string => {
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};

export const getPageLink = (page: number, tag: string) => {
    if (page === 1) {
      return tag ? getTagLink(tag) : pathJoin(BASE_PATH, '/')
    }
    return tag
      ? pathJoin(
          BASE_PATH,
          `/tag/${encodeURIComponent(tag)}/page/${page.toString()}`
        )
      : pathJoin(BASE_PATH, `/page/${page.toString()}`)
  }

export const sortPostsByDate = (posts: Post[]): Post[] => {
    return posts.sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
}

export const retPartOfPosts = (posts: Post[], page: number): Post[] => {
    return posts.slice((page-1)*postsPerPageNumber, (page-1)*postsPerPageNumber+postsPerPageNumber);
}

export const getTags = (posts: Post[]): string[] => {
  return posts.reduce((acc: string[], post: Post) => {
    post.Tags.forEach((tag: string) => {
      if (!acc.includes(tag)) {
        acc.push(tag);
      }
    });
    return acc;
  }, []);
}