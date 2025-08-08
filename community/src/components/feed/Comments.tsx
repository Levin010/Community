import { db } from "@/db";
import { comments, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
import CommentList from "./CommentList";

const Comments = async ({postId}:{postId:number}) => {

  const commentsData = await db
    .select({
      id: comments.id,
      desc: comments.desc,
      createdAt: comments.createdAt,
      userId: comments.userId,
      postId: comments.postId,
      user: {
        id: users.id,
        username: users.username,
        avatar: users.avatar,
        name: users.name,
        surname: users.surname,
      },
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.postId, postId));

  return (
    <div className="">
      {/* WRITE */}
      <CommentList comments={commentsData} postId={postId}/>
    </div>
  );
};

export default Comments;