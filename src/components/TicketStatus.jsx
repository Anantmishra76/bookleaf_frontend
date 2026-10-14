const TicketStatus = ({ status }) => {
  const colors = {
    OPEN: "bg-blue-50 text-blue-700",
    IN_PROGRESS: "bg-amber-50 text-amber-800",
    RESOLVED: "bg-teal-50 text-teal-800",
    CLOSED: "bg-slate-100 text-slate-600",
  };
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${colors[status] || colors.OPEN}`}>{status?.replaceAll("_", " ") || "Unknown"}</span>;
};

export default TicketStatus;
