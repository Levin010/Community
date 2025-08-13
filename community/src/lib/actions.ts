"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { posts, likes, comments, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";


export const updateProfile = async (
  prevState: { success: boolean; error: boolean },
  payload: { formData: FormData; cover: string }
) => {
  const { formData, cover } = payload;
  const fields = Object.fromEntries(formData);

  const filteredFields = Object.fromEntries(
    Object.entries(fields).filter(([_, value]) => value !== "")
  );

  const Profile = z.object({
    cover: z.string().optional(),
    name: z.string().max(60).optional(),
    surname: z.string().max(60).optional(),
    description: z.string().max(255).optional(),
    city: z.string().max(60).optional(),
    school: z.string().max(60).optional(),
    work: z.string().max(60).optional(),
    website: z.string().max(60).optional(),
  });

  const validatedFields = Profile.safeParse({ cover, ...filteredFields });

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return { success: false, error: true };
  }

  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: true };
  }

  try {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: validatedFields.data,
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const switchLike = async (postId: number) => {
  const { userId } = await auth();

  if (!userId) throw new Error("User is not authenticated!");

  try {
    const existingLike = await db
      .select()
      .from(likes)
      .where(and(eq(likes.postId, postId), eq(likes.userId, userId)))
      .limit(1);

    if (existingLike.length > 0) {
      await db
        .delete(likes)
        .where(eq(likes.id, existingLike[0].id));
    } else {
      await db
        .insert(likes)
        .values({
          postId,
          userId,
        });
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong");
  }
};

export const addComment = async (postId: number, desc: string) => {
  const { userId } = await auth();

  if (!userId) throw new Error("User is not authenticated!");

  try {
    const [createdComment] = await db
      .insert(comments)
      .values({
        desc,
        userId,
        postId,
      })
      .returning();

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const commentWithUser = {
      ...createdComment,
      user: user[0],
    };

    return commentWithUser;
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const addPost = async (formData: FormData, img?: string, video?: string) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.log("No userId found");
      throw new Error("User is not authenticated!");
    }

    const desc = formData.get("desc") as string;
    const Desc = z.string().min(1).max(255);
    const validatedDesc = Desc.safeParse(desc);

    if (!validatedDesc.success) {
      console.log("Description validation failed:", validatedDesc.error);
      return { error: "Invalid description" };
    }

    await db.insert(posts).values({
      desc: validatedDesc.data,
      userId,
      ...(img && img.trim() && { img }),
      ...(video && video.trim() && { video }),
    });

    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.log("Error in addPost:", err);
    throw err;
  }
};

export const deletePost = async (postId: number) => {
  const { userId } = await auth();

  if (!userId) throw new Error("User is not authenticated!");

  try {
    await db.delete(posts).where(
      and(
        eq(posts.id, postId),
        eq(posts.userId, userId)
      )
    );
    revalidatePath("/");
  } catch (err) {
    console.log(err);
  }
};