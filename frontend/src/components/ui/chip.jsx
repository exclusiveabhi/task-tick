import * as React from "react";

export function Chip({ color = "default", children }) {
  const colorClasses = {
    default: "bg-gray-200 text-gray-800",
    green: "bg-green-100 text-green-800 border-green-300",
    red: "bg-red-100 text-red-800 border-red-300",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
    blue: "bg-blue-100 text-blue-800 border-blue-300",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        colorClasses[color] || colorClasses.default
      }`}
    >
      {children}
    </span>
  );
}
