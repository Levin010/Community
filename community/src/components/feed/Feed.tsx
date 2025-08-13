import Post from "./Post";
import { db } from "@/db";
import { posts, users, likes, comments } from "@/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";

const Feed = async ({ username }: { username?: string }) => {
  let postsData: any[] = [];

  if (username) {
    // Show posts from user profile
    const rawPosts = await db
      .select({
        id: posts.id,
        desc: posts.desc,
        img: posts.img,
        video:posts.video,
        createdAt: posts.createdAt,
        userId: posts.userId,
        user: {
          id: users.id,
          username: users.username,
          avatar: users.avatar,
          name: users.name,
          surname: users.surname,
          role: users.role,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(users.username, username))
      .orderBy(desc(posts.createdAt));

    // Get likes and comment counts for each post
    postsData = await Promise.all(
      rawPosts.map(async (post) => {
        const postLikes = await db
          .select({ userId: likes.userId })
          .from(likes)
          .where(eq(likes.postId, post.id));

        const commentCount = await db
          .select({ count: count() })
          .from(comments)
          .where(eq(comments.postId, post.id));

        return {
          ...post,
          likes: postLikes,
          _count: {
            comments: commentCount[0]?.count || 0,
          },
        };
      })
    );
  } else {
    // Show all posts on home feed
    const rawPosts = await db
      .select({
        id: posts.id,
        desc: posts.desc,
        img: posts.img,
        video:posts.video,
        createdAt: posts.createdAt,
        userId: posts.userId,
        user: {
          id: users.id,
          username: users.username,
          avatar: users.avatar,
          name: users.name,
          surname: users.surname,
          role: users.role,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt));

    // Get likes and comment counts for each post
    postsData = await Promise.all(
      rawPosts.map(async (post) => {
        const postLikes = await db
          .select({ userId: likes.userId })
          .from(likes)
          .where(eq(likes.postId, post.id));

        const commentCount = await db
          .select({ count: count() })
          .from(comments)
          .where(eq(comments.postId, post.id));

        return {
          ...post,
          likes: postLikes,
          _count: {
            comments: commentCount[0]?.count || 0,
          },
        };
      })
    );
  }

  return (
    <div className="p-4 bg-white shadow-md rounded-lg flex flex-col gap-12">
      {postsData.length ? (postsData.map(post => (
        <Post key={post.id} post={post} />
      ))) : "No posts found!"}
    </div>
  );
};

export default Feed;