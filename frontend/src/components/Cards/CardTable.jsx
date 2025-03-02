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

  //Handle Block action
  const handleBlock = (user) => {
    // If user is already blocked, unblock directly without modal
    if (user.isBlocked) {
      handleBlockUser(user._id, true);
    } else {
      // For blocking, show modal to get reason
      setSelectedUser(user);
      setIsBlockModalOpen(true);
    }
  };

  //Handle Block Confirm from modal
  const handleBlockConfirm = (reason) => {
    if (!selectedUser) return;

    // For blocking, use the reason provided in the modal
    handleBlockUser(selectedUser._id, false, reason);

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
          (color === "light"
            ? "bg-white dark:bg-gray-800"
            : "bg-primary dark:bg-primary-700 text-white")
        }
      >
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                Users Table
              </h3>
            </div>
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <input
                type="text"
                placeholder="Search users..."
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="block w-full overflow-x-auto">
          <table className="items-center w-full bg-transparent border-collapse">
            <thead>
              <tr>
                {["Username", "Email", "Role", "Status", "Actions"].map((header, index) => (
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
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500 dark:text-gray-300">
                    Loading...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500 dark:text-gray-300">
                    No users found
                  </td>
                </tr>
              ) : (
                currentItems.map((user, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <div className="flex items-center">
                        <img
                          src={user.profilePicture || "/default-avatar.png"}
                          className="h-10 w-10 rounded-full border object-cover dark:opacity-80"
                          alt={user.username}
                        />
                        <div className="ml-3">
                          <span className="font-bold text-gray-800 dark:text-white">
                            {user.username}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-gray-600 dark:text-gray-300">
                      {user.email}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${user.role === 'admin'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                        : 'bg-secondary-100 dark:bg-secondary-900 text-secondary-600 dark:text-secondary-300'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <i className={`fas fa-circle ${!user.isBlocked ? "text-primary" : "text-gray-400"} mr-2`}></i>{" "}
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                      <button
                        onClick={() => handleBlock(user)}
                        className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors duration-200 mr-2"
                        title={user.isBlocked ? 'Unblock' : 'Block'}
                      >
                        <i className={`fas ${user.isBlocked ? 'fa-unlock' : 'fa-lock'}`}></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex-1 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
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
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium ${currentPage === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
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
                          ? "z-10 bg-primary dark:bg-primary-600 border-primary dark:border-primary-600 text-white"
                          : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                        }
                      `}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium ${currentPage === totalPages
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
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
      {isBlockModalOpen && (
        <CardBlock
          isOpen={isBlockModalOpen}
          onClose={() => setIsBlockModalOpen(false)}
          onConfirm={handleBlockConfirm}
        />
      )}
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