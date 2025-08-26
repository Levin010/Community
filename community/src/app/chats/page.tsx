import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { chats, users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import LeftMenu from "@/components/leftMenu/LeftMenu";
import RightMenu from "@/components/rightMenu/RightMenu";
import { sql } from "drizzle-orm";
import { BadgeCheck } from "lucide-react";

const ChatsPage = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const userChats = await db
    .select({
      id: chats.id,
      doctorId: chats.doctorId,
      patientId: chats.patientId,
      createdAt: chats.createdAt,
      doctorName: sql<string>`doctor.name`.as('doctorName'),
      doctorSurname: sql<string>`doctor.surname`.as('doctorSurname'),
      doctorUsername: sql<string>`doctor.username`.as('doctorUsername'),
      doctorAvatar: sql<string>`doctor.avatar`.as('doctorAvatar'),
      patientUsername: sql<string>`patient.username`.as('patientUsername'),
      patientAvatar: sql<string>`patient.avatar`.as('patientAvatar'),
    })
    .from(chats)
    .leftJoin(sql`${users} as doctor`, sql`doctor.id = ${chats.doctorId}`)
    .leftJoin(sql`${users} as patient`, sql`patient.id = ${chats.patientId}`)
    .where(or(eq(chats.doctorId, userId), eq(chats.patientId, userId)));


  return (
    <div className="flex gap-6 pt-1 h-[calc(100vh-96px)] overflow-hidden">
      <div className="hidden xl:block w-[20%] overflow-y-auto">
        <LeftMenu type="home" />
      </div>
      <div className="w-full lg:w-[70%] xl:w-[50%] overflow-y-auto">
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl font-bold">My Chats</h1>
          <div className="space-y-4">
            {userChats.map((chat) => {
                const isDoctor = chat.doctorId === userId;
                const otherUserName = isDoctor 
                    ? chat.patientUsername || "Anonymous Patient"
                    : (chat.doctorName && chat.doctorSurname 
                        ? `${chat.doctorName} ${chat.doctorSurname}` 
                        : chat.doctorUsername || "Doctor");
                const otherUserAvatar = isDoctor ? chat.patientAvatar : chat.doctorAvatar;
                const isOtherUserDoctor = !isDoctor;

                return (
                    <Link
                    key={chat.id}
                    href={`/chats/${chat.id}`}
                    className="block p-4 rounded-lg hover:bg-gray-200"
                    >
                    <div className="flex items-center gap-3">
                        <img 
                            src={otherUserAvatar || "/noAvatar.png"} 
                            alt="" 
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <div className="flex items-center gap-0.5">
                                <div className="font-medium">{otherUserName}</div>
                                {isOtherUserDoctor && (
                                    <BadgeCheck size={20} className="fill-violet-900 text-white" />
                                )}
                            </div>
                            <div className="text-sm text-gray-500">
                            Started {chat.createdAt.toLocaleDateString()}
                            </div>
                        </div>
                        </div>
                    </Link>
                );
            })}
          </div>
        </div>
      </div>
      <div className="hidden lg:block w-[30%] overflow-y-auto">
        <RightMenu />
      </div>
    </div>
  );
};

export default ChatsPage;