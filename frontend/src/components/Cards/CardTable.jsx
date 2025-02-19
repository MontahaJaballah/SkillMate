import React from "react";

export default function CardTable() {
  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-white">
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3 className="font-semibold text-lg text-gray-800">Card Tables</h3>
            </div>
          </div>
        </div>
        <div className="block w-full overflow-x-auto">
          {/* Projects table */}
          <table className="items-center w-full bg-transparent border-collapse">
            <thead>
              <tr>
                <th className="px-6 bg-gray-100 text-gray-600 align-middle border border-solid border-gray-200 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  Project
                </th>
                <th className="px-6 bg-gray-100 text-gray-600 align-middle border border-solid border-gray-200 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  Budget
                </th>
                <th className="px-6 bg-gray-100 text-gray-600 align-middle border border-solid border-gray-200 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  Status
                </th>
                <th className="px-6 bg-gray-100 text-gray-600 align-middle border border-solid border-gray-200 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  Users
                </th>
                <th className="px-6 bg-gray-100 text-gray-600 align-middle border border-solid border-gray-200 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  Completion
                </th>
                <th className="px-6 bg-gray-100 text-gray-600 align-middle border border-solid border-gray-200 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left flex items-center">
                  <img
                    src="https://demos.creative-tim.com/notus-react/static/media/bootstrap.bd712487.jpg"
                    className="h-12 w-12 bg-white rounded-full border"
                    alt="..."
                  />{" "}
                  <span className="ml-3 font-bold text-gray-700">
                    Argon Design System
                  </span>
                </th>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                  $2,500 USD
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                  <i className="fas fa-circle text-orange-500 mr-2"></i> pending
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                  <div className="flex">
                    <img
                      src="https://demos.creative-tim.com/notus-react/static/media/team-1-800x800.fa5a7ac2.jpg"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-gray-100 shadow -ml-4"
                    />
                    <img
                      src="https://demos.creative-tim.com/notus-react/static/media/team-2-800x800.3e08ef14.jpg"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-gray-100 shadow -ml-4"
                    />
                    <img
                      src="https://demos.creative-tim.com/notus-react/static/media/team-3-800x800.19201574.jpg"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-gray-100 shadow -ml-4"
                    />
                    <img
                      src="https://demos.creative-tim.com/notus-react/static/media/team-4-800x800.88c40d7b.jpg"
                      alt="..."
                      className="w-10 h-10 rounded-full border-2 border-gray-100 shadow -ml-4"
                    />
                  </div>
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                  <div className="flex items-center">
                    <span className="mr-2">60%</span>
                    <div className="relative w-full">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-red-200">
                        <div
                          style={{ width: "60%" }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                        ></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-right">
                  <button
                    className="text-gray-500 bg-transparent border border-solid border-gray-200 hover:bg-gray-50 font-bold uppercase text-xs px-4 py-2 rounded outline-none focus:outline-none mr-1 mb-1"
                    type="button"
                    style={{ transition: "all .15s ease" }}
                  >
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                </td>
              </tr>
              {/* Add more project rows here */}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
