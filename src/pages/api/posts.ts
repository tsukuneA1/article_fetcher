import { convertQiitaToPost, convertZennToPost } from "../../libs/functions";
import type { Post, QiitaItemResponse, User, ZennPost } from "../../libs/interfaces";
import {  getUsers } from "../../libs/micro";

const CACHE_DURATION = 60 * 60 * 1000; // 1時間キャッシュ
let cachedData: Post[] | null = null;
let lastFetchTime = 0;

const token = import.meta.env.QIITA_TOKEN as string;

export const fetchPostsOfUser = async (user: User): Promise<Post[]> => {
    const qiitaResponse = await fetch(`https://qiita.com/api/v2/users/${user.qiitaId}/items?per_page=10`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const zennResponse = await fetch(`https://zenn.dev/api/articles?username=${user.zennId}&order=latest`);
    
    console.log(`qiitaResponse: ${qiitaResponse.status}, zennResponse: ${zennResponse.status}`);
    if(qiitaResponse.ok && zennResponse.ok) {
        const qiitaData = await qiitaResponse.json()
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

export async function GET() {
    const response = await getUsers({ fields: ["userName", "zennId", "qiitaId"] });
    const users: User[] = response.contents;

  // キャッシュがあり、有効期限内ならキャッシュを返す
  if (cachedData && Date.now() - lastFetchTime < CACHE_DURATION) {
    return new Response(JSON.stringify(cachedData), {
      headers: { "Content-Type": "application/json" },
    });
  }
  const batchSize = 5; // 一度に処理するユーザー数
    let posts: Post[] = [];

  for (let i = 0; i < users.length; i += batchSize) {
          const batchUsers = users.slice(i, i + batchSize);
          const batchPosts = await Promise.all(batchUsers.map(user => fetchPostsOfUser(user)));
          posts = [...posts, ...batchPosts.flat()];
          posts.sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
      }

    console.log(`fetced by api posts: ${posts.length}`);

  return new Response(JSON.stringify(posts), {
    headers: { "Content-Type": "application/json" },
  });
}
