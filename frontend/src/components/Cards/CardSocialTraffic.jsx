import React from "react";

export default function CardSocialTraffic() {
  const socialData = [
    {
      platform: "Facebook",
      visitors: "1,480",
      percentage: 60,
      color: "bg-blue-500",
      darkColor: "bg-blue-600",
    },
    {
      platform: "LinkedIn",
      visitors: "1,046",
      percentage: 46,
      color: "bg-blue-700",
      darkColor: "bg-blue-800",
    },
    {
      platform: "Google",
      visitors: "854",
      percentage: 37,
      color: "bg-red-500",
      darkColor: "bg-red-600",
    },
    {
      platform: "Twitter",
      visitors: "612",
      percentage: 25,
      color: "bg-blue-400",
      darkColor: "bg-blue-500",
    },
  ];

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white dark:bg-gray-800 w-full mb-6 shadow-lg rounded">
      <div className="rounded-t mb-0 px-4 py-3 border-0">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full px-4 max-w-full flex-grow flex-1">
            <h3 className="font-semibold text-base text-gray-800 dark:text-white">
              Social Traffic
            </h3>
          </div>
        </div>
      </div>
      <div className="block w-full overflow-x-auto">
        <table className="items-center w-full bg-transparent border-collapse">
          <tbody>
            {socialData.map((social, index) => (
              <tr
                key={index}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left text-gray-800 dark:text-white">
                  {social.platform}
                </th>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-gray-600 dark:text-gray-300">
                  {social.visitors}
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                  <div className="flex items-center">
                    <span className="mr-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                      {social.percentage}%
                    </span>
                    <div className="relative w-full">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                        <div
                          style={{ width: `${social.percentage}%` }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${social.color} dark:${social.darkColor}`}
                        ></div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}