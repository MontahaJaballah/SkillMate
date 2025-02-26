import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { CardBlock, Notification } from "./CardBlock";
import useAxios from "../../hooks/useAxios";
import { format, parseISO } from "date-fns";

export default function CardTable({ color = "light" }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const axiosInstance = useAxios();
  const itemsPerPage = 5;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/users/allusers");
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setNotification({
        message: "Failed to load users",
        type: "error"
      });
      setLoading(false);
    }
  };

  //Handle Block
  const handleBlock = (user) => {
    setSelectedUser(user);
    setIsBlockModalOpen(true);
  };

  const handleBlockUser = async (userId, isBlocked, reason = "") => {
    try {
      const endpoint = isBlocked ? `/users/unblockuser/${userId}` : `/users/blockuser/${userId}`;
      await axiosInstance.put(endpoint, { reason, sendEmail: true });
      fetchUsers();
      setNotification({
        message: `User ${isBlocked ? "unblocked" : "blocked"} successfully`,
        type: "success",
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      setNotification({
        message: `Failed to ${isBlocked ? "unblock" : "block"} user`,
        type: "error",
      });
    }
  };

  //Handle Block Confirm
  const handleBlockConfirm = (reason) => {
    if (!selectedUser) return;

    // Check if user is already blocked - if so, unblock; otherwise block
    handleBlockUser(selectedUser._id, selectedUser.isBlocked, reason);

    // Reset state
    setSelectedUser(null);
    setIsBlockModalOpen(false);
  };

  // Filter data based on search term
  const filteredData = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user?.username || '').toLowerCase().includes(searchLower) ||
      (user?.email || '').toLowerCase().includes(searchLower) ||
      (user?.role || '').toLowerCase().includes(searchLower)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };


  return (
    <>
      <div
        className={
          "relative flex flex-col min-w-0 break-words w-full shadow-lg rounded " +
          (color === "light" ? "bg-white" : "bg-primary text-white")
        }
      >
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <div className="flex flex-wrap items-center justify-between">
            <div className="relative w-full md:w-1/3 px-4 max-w-full flex-grow flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fas fa-search text-primary text-lg"></i>
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full px-4 py-3.5 pl-12 text-sm font-medium text-gray-700 bg-gray-50 border-2 border-gray-100 rounded-xl placeholder-gray-500 shadow-lg transition-all duration-200 ease-in-out hover:border-gray-300 focus:border-primary focus:outline-none focus:shadow-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="relative w-full md:w-auto px-4 max-w-full flex-grow flex-1 text-right">
              <button
                className="bg-primary text-white active:bg-primary-600 text-xs font-bold uppercase px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
              >
                <i className="fas fa-plus mr-2"></i> Add User
              </button>
            </div>
          </div>
        </div>
        <div className="block w-full overflow-x-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <i className="fas fa-circle-notch fa-spin text-2xl text-primary mb-2"></i>
                <p>Loading...</p>
              </div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                  <i className="fas fa-users text-4xl text-gray-400"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Users Found</h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? "No users match your search criteria. Try a different search term."
                    : "There are no users in the system yet."}
                </p>
              </div>
            </div>
          ) : (
            <table className="items-center w-full bg-transparent border-collapse">
              <thead className="sticky top-0 bg-white">
                <tr>
                  <th className="px-6 bg-dark-50 text-dark-600 align-middle border border-solid border-dark-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-heading font-semibold text-left">
                    User Info
                  </th>
                  <th className="px-6 bg-dark-50 text-dark-600 align-middle border border-solid border-dark-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-heading font-semibold text-left">
                    Role
                  </th>
                  <th className="px-6 bg-dark-50 text-dark-600 align-middle border border-solid border-dark-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-heading font-semibold text-left">
                    Status
                  </th>
                  <th className="px-6 bg-dark-50 text-dark-600 align-middle border border-solid border-dark-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-heading font-semibold text-left">
                    Created
                  </th>
                  <th className="px-6 bg-dark-50 text-dark-600 align-middle border border-solid border-dark-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-heading font-semibold text-left">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((user, index) => (
                  <tr key={index}>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <div className="flex items-center">
                        <img
                          src={user.profilePicture || "https://via.placeholder.com/40"}
                          className="h-12 w-12 bg-white rounded-full border object-cover"
                          alt={user.username}
                        />
                        <div className="ml-3">
                          <span className="font-bold text-dark-700">{user.username}</span>
                          <p className="text-gray-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <span className={`${user.role === "student" ? "bg-primary-100 text-primary-600" : "bg-secondary-100 text-secondary-600"
                        } text-xs font-semibold px-2 py-1 rounded`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <i className={`fas fa-circle ${user.status === "active" ? "text-primary" : "text-gray-400"
                        } mr-2`}></i>{" "}
                      {user.status}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      {user.createdAt ? (
                        format(parseISO(user.createdAt), 'MMM dd, yyyy')
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <button
                        className="text-dark-600 hover:text-blue-400 transition-colors duration-200 mr-2"
                        title="Edit"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => {
                          if (user.isBlocked) {
                            // For unblocking, no need to show the modal
                            handleBlockUser(user._id, true);
                          } else {
                            // For blocking, show the modal to select a reason
                            handleBlock(user);
                          }
                        }}
                        className="text-dark-600 transition-colors duration-200 mr-2"
                        title={user.isBlocked ? 'Unblock' : 'Block'}
                      >
                        <i className={user.isBlocked ? 'fas fa-unlock hover:text-primary' : 'fas fa-lock hover:text-red-400'}></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination - Only show if there are items */}
        {filteredData.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex-1 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstItem + 1}</span>
                  {" - "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredData.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{filteredData.length}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50"
                      }`}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                        ${currentPage === i + 1
                          ? "z-10 bg-primary border-primary text-white"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }
                      `}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50"
                      }`}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Block Reason Modal */}
      <CardBlock
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onConfirm={handleBlockConfirm}
      />

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
}

CardTable.propTypes = {
  color: PropTypes.oneOf(["light", "dark"]),
};