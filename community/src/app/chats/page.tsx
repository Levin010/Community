import Chats from "@/components/chats/Chats";
import LeftMenu from "@/components/leftMenu/LeftMenu";
import RightMenu from "@/components/rightMenu/RightMenu";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const Homepage = async ({ searchParams }: { searchParams: Promise<{ doctorId?: string; patientId?: string }> }) => {
  const { doctorId, patientId } = await searchParams;

  let doctorName = "Unknown Doctor";
  let patientName = "Anonymous Patient";

  if (doctorId && patientId) {
    const [doctorData] = await db
      .select({
        username: users.username,
        name: users.name,
        surname: users.surname,
      })
      .from(users)
      .where(eq(users.id, doctorId))
      .limit(1);

    const [patientData] = await db
      .select({
        username: users.username,
      })
      .from(users)
      .where(eq(users.id, patientId))
      .limit(1);

    doctorName = doctorData?.name && doctorData?.surname 
      ? `${doctorData.name} ${doctorData.surname}`
      : doctorData?.username || 'Unknown Doctor';

    patientName = patientData?.username || 'Anonymous Patient';
  }

  return (
    <div className="flex gap-6 pt-6">
      <div className="hidden xl:block w-[20%]">
        <LeftMenu type="home" />
      </div>
      <div className="w-full lg:w-[70%] xl:w-[50%]">
        <div className="flex flex-col gap-6">
          <Chats doctorName={doctorName} patientName={patientName} />
        </div>
      </div>
      <div className="hidden lg:block w-[30%]">
        <RightMenu />
      </div>
    </div>
  );
};

export default Homepage;