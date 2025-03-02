import React from "react";

// components
import CardTable from "../../components/Cards/CardTable.jsx";

export default function Tables() {
  return (
    <>
      <div className="flex flex-wrap mt-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
        <div className="w-full mb-12 px-4">
          <CardTable />
        </div>
      </div>
    </>
  );
}
