import React from "react";

export default function CardPageVisits() {
  const tableData = [
    {
      page: "/dashboard",
      visitors: "4,569",
      uniqueUsers: "340",
      bounceRate: "46,53%",
    },
    {
      page: "/profile",
      visitors: "3,985",
      uniqueUsers: "289",
      bounceRate: "36,42%",
    },
    {
      page: "/courses",
      visitors: "2,789",
      uniqueUsers: "229",
      bounceRate: "56,14%",
    },
    {
      page: "/admin",
      visitors: "2,445",
      uniqueUsers: "184",
      bounceRate: "36,45%",
    },
    {
      page: "/settings",
      visitors: "1,789",
      uniqueUsers: "145",
      bounceRate: "26,54%",
    },
  ];

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white dark:bg-gray-800 w-full mb-6 shadow-lg rounded">
      <div className="rounded-t mb-0 px-4 py-3 border-0">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full px-4 max-w-full flex-grow flex-1">
            <h3 className="font-semibold text-base text-gray-800 dark:text-white">
              Page Visits
            </h3>
          </div>
          <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
            <button
              className="bg-primary text-white active:bg-primary-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
              type="button"
            >
              See all
            </button>
          </div>
        </div>
      </div>
      <div className="block w-full overflow-x-auto">
        <table className="items-center w-full bg-transparent border-collapse">
          <thead>
            <tr>
              {["Page", "Visitors", "Unique Users", "Bounce Rate"].map((header, index) => (
                <th
                  key={index}
                  className="px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr
                key={index}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left text-gray-800 dark:text-white">
                  {row.page}
                </th>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-gray-600 dark:text-gray-300">
                  {row.visitors}
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-gray-600 dark:text-gray-300">
                  {row.uniqueUsers}
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-gray-600 dark:text-gray-300">
                  {row.bounceRate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}