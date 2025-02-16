import { getTagLink } from "../components/PostTags.astro";
import type { Post, QiitaItemResponse, ZennPost } from "./interfaces";

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
        Icon: {Type: 'external',Emoji: qiitaPost.user.profile_image_url},
        Slug: qiitaPost.url,
        Date: qiitaPost.created_at,
        Tags: qiitaPost.tags.map((tag) => tag.name),
        Excerpt: qiitaPost.body,
        Link: qiitaPost.url,
        ShowAuthor: false,
        Author: qiitaPost.user.name,
        FeaturedImage: null,

    };
};

export const convertZennToPost = (zennPost: ZennPost): Post => {
    return {
        Title: zennPost.title,
        Icon: {Type: 'external', Emoji: zennPost.user.avatar_small_url},
        Slug: zennPost.path,
        Date: zennPost.published_at,
        Tags: [],
        Excerpt: '',
        Link: `zenn.dev/${zennPost.path}`,
        ShowAuthor: false,
        Author: zennPost.user.name,
        FeaturedImage: null,
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