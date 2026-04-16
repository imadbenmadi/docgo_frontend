import React from "react";

const statusStyles = {
  rejected: {
    background: "bg-red-600",
    text: "text-sky-50",
  },
  accepted: {
    background: "bg-green-500",
    text: "text-sky-50",
  },
  pending: {
    background: "bg-amber-400",
    text: "text-sky-50",
  },
};

const statusText = {
  rejected: "Refuser",
  accepted: "Accepter",
  pending: "En attente",
};

export const StatusBadge = ({ status }) => {
  const styles = statusStyles[status];

  return (
    <span
      role="status"
      className={`inline-block px-10 py-2 text-base leading-relaxed whitespace-nowrap ${styles.background} ${styles.text} rounded-[56px] max-md:px-5`}
    >
      {statusText[status]}
    </span>
  );
};
