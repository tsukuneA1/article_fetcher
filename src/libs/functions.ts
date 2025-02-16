import type { Post, QiitaItemResponse, ZennPost } from "./interfaces";

export const convertQiitaToPost = (qiitaPost: QiitaItemResponse): Post => {
    return {
        Title: qiitaPost.title,
        Icon: {Type: 'external',Emoji: qiitaPost.user.profile_image_url},
        Slug: qiitaPost.url,
        Date: qiitaPost.created_at,
        Tags: qiitaPost.tags.map((tag) => tag.name),
        Excerpt: qiitaPost.rendered_body,
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