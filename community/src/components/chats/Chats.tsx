// "use client";

// import { useSearchParams } from "next/navigation";

// const Chats = () => {
//   const searchParams = useSearchParams();
//   const doctorName = searchParams.get('doctorName');
//   const patientName = searchParams.get('patientName');

//   console.log("URL params - doctorName:", doctorName);
//   console.log("URL params - patientName:", patientName);
//   console.log("All search params:", Object.fromEntries(searchParams.entries()));

//   return (
//     <div className="p-4 bg-white shadow-md rounded-lg flex flex-col gap-12">
//       Chat between {patientName} and {doctorName}
//     </div>
//   );
// };


// export default Chats;

const Chats = ({ doctorName, patientName }: { doctorName: string; patientName: string }) => {
  return (
    <div className="p-4 bg-white shadow-md rounded-lg flex flex-col gap-12">
      Chat between {patientName} and {doctorName}
    </div>
  );
};

export default Chats;