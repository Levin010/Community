const Chats = ({ doctorName, patientName }: { doctorName: string; patientName: string }) => {
  return (
    <div className="p-4 bg-white shadow-md rounded-lg flex flex-col gap-12">
      Chat between {patientName} and {doctorName}
    </div>
  );
};

export default Chats;