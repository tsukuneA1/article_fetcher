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
    const qiitaResponse = await fetch(`https://qiita.com/api/v2/users/${user.qiitaId}/items?per_page=1`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const zennResponse = await fetch(`https://zenn.dev/api/articles?username=${user.zennId}&order=latest`);
    
    console.log(`qiitaResponse: ${qiitaResponse.status}, zennResponse: ${zennResponse.status}`);
    if(qiitaResponse.ok && zennResponse.ok) {
        const qiitaData = await qiitaResponse.json();
        const zennData = await zennResponse.json()
        if(!zennData.articles){
            return [];
        }
        const posts = [...qiitaData.map((qiita: QiitaItemResponse )=> convertQiitaToPost(qiita)), ...zennData.articles.map((zenn: ZennPost) => convertZennToPost(zenn))];
        
        return posts;
    }
    
    if(!qiitaResponse.ok && zennResponse.ok) {
        const zennData = await zennResponse.json();
        if(!zennData.articles){
            return [];
        }
        const posts = [...zennData.articles.map((zenn: ZennPost) => convertZennToPost(zenn))];
        return posts;
    }
    return [];
}

export const getAllPosts = async (): Promise<Post[]> => {
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