import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { chats, users, messages } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import ChatRoom from "@/components/chats/ChatRoom";

const ChatPage = async ({ params }: { params: Promise<{ chatId: string[] }> }) => {
  const { userId } = await auth();
  const { chatId } = await params;

  if (!userId) redirect("/sign-in");

  const [chatData] = await db
    .select({
      id: chats.id,
      doctorId: chats.doctorId,
      patientId: chats.patientId,
      doctorName: users.name,
      doctorSurname: users.surname,
      patientUsername: users.username,
    })
    .from(chats)
    .leftJoin(users, eq(users.id, chats.doctorId))
    .where(
      and(
        eq(chats.id, chatId),
        or(eq(chats.doctorId, userId), eq(chats.patientId, userId))
      )
    );

  if (!chatData) redirect("/chats");

  const chatMessages = await db
    .select({
      id: messages.id,
      content: messages.content,
      senderId: messages.senderId,
      createdAt: messages.createdAt,
      senderUsername: users.username,
    })
    .from(messages)
    .leftJoin(users, eq(users.id, messages.senderId))
    .where(eq(messages.chatId, chatId))
    .orderBy(messages.createdAt);

  return (
    <ChatRoom
      chatId={chatId}
      currentUserId={userId}
      messages={chatMessages}
      otherUserName={
        chatData.doctorId === userId
          ? chatData.patientUsername || "Anonymous"
          : `${chatData.doctorName} ${chatData.doctorSurname}` || "Doctor"
      }
    />
  );
};

export default ChatPage;