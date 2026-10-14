export const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
export const priorities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
export const categories = [
  { value: "ROYALTY_PAYMENTS", label: "Royalty & Payments" },
  { value: "ISBN_METADATA_ISSUES", label: "ISBN & Metadata Issues" },
  { value: "PRINTING_QUALITY", label: "Printing & Quality" },
  { value: "DISTRIBUTION_AVAILABILITY", label: "Distribution & Availability" },
  { value: "BOOK_STATUS_PRODUCTION_UPDATES", label: "Book Status & Production Updates" },
  { value: "GENERAL_INQUIRY", label: "General Inquiry" },
];

export const formatLabel = (value) => value?.replaceAll("_", " ") || "Not set";
