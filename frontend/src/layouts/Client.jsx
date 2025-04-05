import React from 'react';
import { Routes, Route } from "react-router-dom";

// Components
import Navbar from "../components/Navbars/Navbar.jsx";
import Footer from "../components/Footers/Footer.jsx";
import Chatbot from "../components/Chatbot/Chatbot.jsx";

// Views
import Landing from "../views/Landing/Landing.jsx";
import Profile from "../views/client/Profile.jsx";
import SearchResults from "../views/client/SearchResults.jsx";
import ChatPage from "../views/client/ChatPage/ChatPage";
import AccountSettings from "../views/client/AccountSettings/AccountSettings";
import CodeCompilerPage from "../views/client/CodeCompilerPage/CodeCompilerPage.jsx";
import CodeCollaborationPage from "../views/client/CodeCollaborationPage/CodeCollaborationPage.jsx";
import Courses from "../views/client/Courses/Courses.jsx";
import CourseDetail from "../views/client/CourseDetail/CourseDetail";
import CreateCourseView from "../views/client/CreateCourseView/CreateCourseView";
import RecipeGenerator from "../components/RecipeGenerator";
import CookingAssistant from "../components/CookingAssistant";

export default function Client() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* Define all client routes here */}
          <Route path="landing" element={<Landing />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:id" element={<Profile />} />
          <Route path="search/:query" element={<SearchResults />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="settings" element={<AccountSettings />} />
          <Route path="code-compiler" element={<CodeCompilerPage />} />
          <Route path="recipes" element={<RecipeGenerator />} />
        <Route path="cooking-assistant" element={<CookingAssistant />} />
          <Route path="code-collaboration" element={<CodeCollaborationPage />} />
          <Route path="code-collaboration/:roomId" element={<CodeCollaborationPage />} />
          <Route path="courses" element={<Courses />} />
          <Route path="course/:id" element={<CourseDetail />} />
          <Route path="create-course" element={<CreateCourseView />} />          {/* Catch-all route to handle any other paths */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}