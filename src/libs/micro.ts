import { createClient, type MicroCMSQueries } from "microcms-js-sdk";
import type { Post, QiitaItemResponse, User, ZennPost } from "./interfaces";
import { convertQiitaToPost, convertZennToPost } from "./functions";

export const postsPerPageNumber = 10;

const token = import.meta.env.QIITA_TOKEN as string;

const client = createClient({
    serviceDomain: import.meta.env.SERVICE_DOMAIN,
    apiKey: import.meta.env.API_KEY,
});

export const getUsers = async (queries: MicroCMSQueries) => {
    return await client.get({
        endpoint: "astro-blog-winc",
        queries
    })
};

export const getPartOfPosts = async (page: number): Promise<Post[]> => {
    const posts: Post[] = await getAllPosts();
    if(!posts) {
        return [];
    }
	return posts.slice((page-1)*postsPerPageNumber, (page-1)*postsPerPageNumber+postsPerPageNumber);
}

export const fetchPostsOfUser = async (user: User): Promise<Post[]> => {
    console.log(`Fetching posts for user: ${user.qiitaId}, ${user.zennId}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒でタイムアウト

    try {
        const qiitaUrl = `https://qiita.com/api/v2/users/${user.qiitaId}/items?per_page=1`;
        const zennUrl = `https://zenn.dev/api/articles?username=${user.zennId}&order=latest`;

        console.log(`Fetching Qiita: ${qiitaUrl}`);
        console.log(`Fetching Zenn: ${zennUrl}`);

        const qiitaResponse = await fetch(qiitaUrl, {
            headers: { 'Authorization': `Bearer ${token}` },
            signal: controller.signal
        });

        console.log("Qiita Rate Limit:", qiitaResponse.headers.get("X-RateLimit-Remaining"));

        const zennResponse = await fetch(zennUrl, { signal: controller.signal });

        console.log(`Qiita Response Status: ${qiitaResponse.status}`);
        console.log(`Zenn Response Status: ${zennResponse.status}`);

        clearTimeout(timeoutId); // タイマー解除

        if (!qiitaResponse.ok) {
            console.error(`Qiita API failed: ${qiitaResponse.status}`, await qiitaResponse.text());
        }
        if (!zennResponse.ok) {
            console.error(`Zenn API failed: ${zennResponse.status}`, await zennResponse.text());
        }

    } catch (error) {
        console.error("Fetch failed:", error);
    }

    return [];
};

export const getAllPosts = async (): Promise<Post[]> => {
    console.log(`token: ${token}`);
    const response = await getUsers({ fields: ["userName", "zennId", "qiitaId"] });
    const users: User[] = response.contents;
    const batchSize = 5; // 一度に処理するユーザー数
    let posts: Post[] = [];

    for (let i = 0; i < users.length; i += batchSize) {
        const batchUsers = users.slice(i, i + batchSize);
        const batchPosts = await Promise.all(batchUsers.map(user => fetchPostsOfUser(user)));
        posts = [...posts, ...batchPosts.flat()];
    }

    return posts.sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
}

export const getPostsByTag = async (tag: string): Promise<Post[]> => {
    if(!tag) {
        return [];
    }
    const posts = await getAllPosts();
    return posts.filter((post) => post.Tags.find(tagName => tagName === tag)).slice(0, postsPerPageNumber);
}

export const getAllTags = async (): Promise<string[]> => {
    const posts = await getAllPosts();
    if(!posts) {
        return [];
    }
    interface TagCount {
        tag: string | undefined;
        count: number;
    }

    const AllowDuplicatesTags:TagCount[] = [];
    posts.map((post) => {
        if(!post) {
            return;
        }
        if(!post.Tags) {
            return;
        }
        post.Tags.map((tagName) => {
            if(!tagName) {
                return;
            }
            else if(AllowDuplicatesTags.find((tag) => tag.tag == tagName)) {
                AllowDuplicatesTags.find((tag) => tag.tag == tagName)!.count++;
            } else {
                AllowDuplicatesTags.push({
                    tag: tagName,
                    count: 1
                });
            }
        })
    })

    AllowDuplicatesTags.sort((a , b) => b.count - a.count);

    const tags: string[] = [];
    AllowDuplicatesTags.map((tag) => {
        if(tag.tag){
            tags.push(tag.tag);
        }
    });
    return tags;
}

export const getNumberOfPages = async () => {
    const posts = await getAllPosts();
    const numberOfPages = Math.ceil(posts.flat().length/postsPerPageNumber);
    
    return numberOfPages;
}