// SkillMate/frontend/src/components/AuthProvider/AuthProvider.jsx
import { createContext, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-hot-toast";
import axios from "axios";

export const Context = createContext("");

const api = axios.create({
  baseURL: 'http://localhost:5000/api',  // adjust to your backend URL
  withCredentials: true
});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loader, setLoader] = useState(false);

  const signInUser = async (email, password) => {
    setLoader(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data.user);
      toast.success("Sign in successful!");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Sign in failed");
      throw error;
    } finally {
      setLoader(false);
    }
  };

  const signOutUser = async () => {
    setLoader(true);
    try {
      await api.post('/auth/logout');
      setUser(null);
      toast.success("Signed out successfully!");
    } catch (error) {
      toast.error("Sign out failed");
      throw error;
    } finally {
      setLoader(false);
    }
  };

  const signUpUser = async (email, password) => {
    setLoader(true);
    try {
      const response = await api.post('/auth/register', { email, password });
      setUser(response.data.user);
      toast.success("Sign up successful!");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Sign up failed");
      throw error;
    } finally {
      setLoader(false);
    }
  };

  const updateUserProfile = async (name, photoUrl) => {
    setLoader(true);
    try {
      const response = await api.put('/auth/profile', { displayName: name, photoURL: photoUrl });
      setUser(response.data.user);
      toast.success("Profile updated!");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
      throw error;
    } finally {
      setLoader(false);
    }
  };

  const authInfo = {
    signUpUser,
    signInUser,
    user,
    loader,
    signOutUser,
    updateUserProfile
  };

  return (
    <Context.Provider value={authInfo}>
      {children}
    </Context.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node
};

export default AuthProvider;