import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";
import { toast } from "react-hot-toast";

const instance = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

const useAxios = () => {
    const { signOutUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const requestInterceptor = instance.interceptors.request.use(
            (config) => {
                // You can add any request preprocessing here
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        const responseInterceptor = instance.interceptors.response.use(
            (response) => {
                return response;
            },
            async (error) => {
                if (error.response?.status === 401) {
                    toast.error("Session expired. Please login again.");
                    await signOutUser();
                    navigate('/login', { replace: true });
                } else if (error.response?.status === 403) {
                    toast.error("You don't have permission to perform this action");
                    navigate('/dashboard', { replace: true });
                } else if (error.response?.status === 500) {
                    toast.error("Server error. Please try again later.");
                } else if (!error.response) {
                    toast.error("Network error. Please check your connection.");
                }
                return Promise.reject(error);
            }
        );

        // Cleanup interceptors on unmount
        return () => {
            instance.interceptors.request.eject(requestInterceptor);
            instance.interceptors.response.eject(responseInterceptor);
        };
    }, [signOutUser, navigate]);

    return instance;
};

export default useAxios;