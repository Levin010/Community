import Image from "next/image";
import Comments from "@/components/feed/Comments";
import { posts, users } from "@/db/schema";
import PostInteraction from "@/components/feed/PostInteraction";
import { Suspense } from "react";
import PostInfo from "@/components/feed/PostInfo";
import { auth } from "@clerk/nextjs/server";
import PostVideo from "./PostVideo";
import { BadgeCheck } from "lucide-react";


type PostType = typeof posts.$inferSelect;
type UserType = typeof users.$inferSelect;

type FeedPostType = PostType & { 
  user: UserType 
} & {
  likes: [{ userId: string }];
} & {
  _count: { comments: number };
};


const Post = async ({ post }: { post: FeedPostType }) => {
  const { userId } = await auth();
  return (
    <div className="flex flex-col gap-4">
      {/* USER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src={post.user.avatar || "/noAvatar.png"}
            width={40}
            height={40}
            alt=""
            className="w-10 h-10 rounded-full"
          />
          <span className="font-medium flex items-center gap-1">
            
            {post.user.role === 'patient' 
                ? 'anonymous' 
                : (post.user.name && post.user.surname
                    ? post.user.name + " " + post.user.surname
                    : post.user.username)
            }
            {post.user.role !== 'patient' && (
            <BadgeCheck size={20} className="fill-violet-900 text-white" />
            )}
          </span>
        </div>
        {userId === post.user.id && <PostInfo postId={post.id} />}
      </div>
      {/* DESC */}
      <div className="flex flex-col gap-4">
        <p>{post.desc}</p>
        {post.img && (
          <div className="w-full min-h-96 relative">
            <Image
              src={post.img}
              fill
              className="object-cover rounded-md"
              alt=""
            />
          </div>
        )}
        {post.video && (
            <PostVideo
                id={`video-${post.id}`}
                src={post.video
                .split("/upload/")[1]
                .split("/").slice(1).join("/")
                .replace(/\.[^/.]+$/, "")}
            />
        )}
      </div>
      {/* INTERACTION */}
      <Suspense fallback="Loading...">
        <PostInteraction
          postId={post.id}
          likes={post.likes.map((like) => like.userId)}
          commentNumber={post._count.comments}
        />
      </Suspense>
      <Suspense fallback="Loading...">
        <Comments postId={post.id} />
      </Suspense>
      <div className="h-px bg-gray-300 mt-3 w-full"></div>
    </div>
  );
};

export default Post;