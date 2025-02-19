import { convertQiitaToPost, convertZennToPost } from "../../libs/functions";
import type { Post, User } from "../../libs/interfaces";
import { fetchPostsOfUser, getUsers } from "../../libs/micro";

const CACHE_DURATION = 60 * 60 * 1000; // 1時間キャッシュ
let cachedData: Post[] | null = null;
let lastFetchTime = 0;

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
      }

    console.log(`api called ${posts}`);

  return new Response(JSON.stringify(posts), {
    headers: { "Content-Type": "application/json" },
  });
}
