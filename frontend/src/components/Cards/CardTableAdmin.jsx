import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { CardBlock, Notification } from "./CardBlockAdmin";
import { format, parseISO } from "date-fns";
import useAxios from "../../hooks/useAxios";

// Default profile picture
const defaultProfilePicture = "https://via.placeholder.com/150";

export default function AdminTable({ color = "light" }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [notification, setNotification] = useState(null);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const axiosInstance = useAxios();
    const itemsPerPage = 5;
    const history = useHistory();

    useEffect(() => {
        fetchAdmins();
    }, []);

    // Fetch admins data
    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("/users/alladmins");
            setAdmins(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching admins:", error);
            setNotification({
                message: "Failed to load admin data",
                type: "error"
            });
            setLoading(false);
        }
    };

    const handleBlock = (admin) => {
        setSelectedAdmin(admin);
        setIsBlockModalOpen(true);
    };

    const handleBlockAdmin = async (userId, isBlocked, reason = "") => {
        try {
            const endpoint = isBlocked ? `/users/unblockuser/${userId}` : `/users/blockuser/${userId}`;
            await axiosInstance.put(endpoint, { reason, sendEmail: true });
            fetchAdmins();
            setNotification({
                message: `admin ${isBlocked ? "unblocked" : "blocked"} successfully`,
                type: "success",
            });
        } catch (error) {
            console.error("Error updating admin status:", error);
            setNotification({
                message: `Failed to ${isBlocked ? "unblock" : "block"} admin`,
                type: "error",
            });
        }
    };

    const handleBlockConfirm = (reason) => {
        if (!selectedAdmin) return;

        // Check if admin is already blocked - if so, unblock; otherwise block
        handleBlockAdmin(selectedAdmin._id, selectedAdmin.isBlocked, reason);

        // Reset state
        setSelectedAdmin(null);
        setIsBlockModalOpen(false);
    };

    const handleEdit = (admin) => {
        // Pass all necessary admin data
        const adminData = {
            _id: admin._id,
            username: admin.username,
            email: admin.email,
            firstName: admin.firstName,
            lastName: admin.lastName,
            phoneNumber: admin.phoneNumber
        };
        history.push('/admin/formuser', { admin: adminData });
    };

    // Filter data based on search term
    const filteredData = admins.filter(admin => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (admin?.username || '').toLowerCase().includes(searchLower) ||
            (admin?.email || '').toLowerCase().includes(searchLower) ||
            (admin?.role || '').toLowerCase().includes(searchLower)
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
            <div className={
                "relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded " +
                (color === "light" ? "bg-white" : "bg-primary text-white")
            }>
                <div className="rounded-t mb-0 px-4 py-3 border-0">
                    <div className="flex flex-wrap items-center justify-between">
                        <div className="relative w-full md:w-1/3 px-4 max-w-full flex-grow flex-1">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i className="fas fa-search text-primary text-lg"></i>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search admins..."
                                    className="w-full px-4 py-3.5 pl-12 text-sm font-medium text-gray-700 bg-gray-50 border-2 border-gray-100 rounded-xl placeholder-gray-500 shadow-lg transition-all duration-200 ease-in-out hover:border-gray-300 focus:border-primary focus:outline-none focus:shadow-xl"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="relative w-full md:w-auto px-4 max-w-full flex-grow flex-1 text-right">
                            <Link to="/admin/formuser">

                                <button
                                    className="bg-primary text-white active:bg-primary-600 text-xs font-bold uppercase px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                    type="button"
                                >
                                    <i className="fas fa-plus mr-2"></i> Add Admin
                                </button>
                            </Link>

                        </div>
                    </div>
                </div>

                <div className="block w-full overflow-x-auto">
                    <table className="items-center w-full bg-transparent border-collapse">
                        <thead>
                            <tr>
                                <th className="px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left bg-dark-50 text-dark-600 border-dark-100">
                                    Admin Info
                                </th>
                                <th className="px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left bg-dark-50 text-dark-600 border-dark-100">
                                    Role
                                </th>
                                <th className="px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left bg-dark-50 text-dark-600 border-dark-100">
                                    Status
                                </th>
                                <th className="px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left bg-dark-50 text-dark-600 border-dark-100">
                                    Created At
                                </th>
                                <th className="px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left bg-dark-50 text-dark-600 border-dark-100">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-4">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-gray-500">
                                        No admins found
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((admin, index) => (
                                    <tr key={index}>
                                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                                            <div className="flex items-center">
                                                <img
                                                    src={admin.profilePicture || defaultProfilePicture}
                                                    className="h-12 w-12 bg-white rounded-full border object-cover"
                                                    alt={admin.username}
                                                />
                                                <div className="ml-3">
                                                    <span className="font-bold text-dark-700">{admin.username}</span>
                                                    <p className="text-gray-500 text-xs">{admin.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                                            <span className={`${admin.role === "admin" ? "bg-blue-100 text-blue-600" : "bg-secondary-100 text-secondary-600"} text-xs font-semibold px-2 py-1 rounded`}>
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                                            <i className={`fas fa-circle ${admin.status === "active" ? "text-primary" : "text-gray-400"} mr-2`}></i>{" "}
                                            {admin.status}
                                        </td>
                                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                                            {admin.createdAt ? (
                                                format(parseISO(admin.createdAt), 'MMM dd, yyyy')
                                            ) : (
                                                'N/A'
                                            )}
                                        </td>
                                        <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                                            <button
                                                onClick={() => handleEdit(admin)}
                                                className="text-dark-600 hover:text-blue-400 transition-colors duration-200 mr-2"
                                                title="Edit"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (admin.isBlocked) {
                                                        // For unblocking, no need to show the modal
                                                        handleBlockAdmin(admin._id, true);
                                                    } else {
                                                        // For blocking, show the modal to select a reason
                                                        handleBlock(admin);
                                                    }
                                                }}
                                                className="text-dark-600 transition-colors duration-200 mr-2"
                                                title={admin.isBlocked ? 'Unblock' : 'Block'}
                                            >
                                                <i className={admin.isBlocked ? 'fas fa-unlock hover:text-primary' : 'fas fa-lock hover:text-red-400'}></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
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

AdminTable.propTypes = {
    color: PropTypes.oneOf(["light", "dark"]),
};