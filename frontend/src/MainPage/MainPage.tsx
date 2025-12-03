/**
 * Main layout and router after user login
 * - Shows navigation bar + main content area
 * - Checks if user is logged in; if not, redirects to login/signup
 * - Defines routes for various pages
 * - Displays a welcome message including user’s name and role
 */

import { Routes, Route, Navigate } from "react-router-dom";
import NavigationBar from "../Nagivation/Navigation";
import Profile from "../Profile/Profile";
import Setting from "../Setting/Setting";
import AIChat from "../AIChat/AIChat";
import Report from "../Report/Report";
import AllProblems from "../Problem/AllProblems";
import ProblemEdit from "../Problem/ProblemEdit";
import AdminControl from "../AdminControl/AdminControl";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

export default function MainPage() {
  const currentUser = useSelector(
    (state: RootState) => state.userReducer.currentUser
  );

  if (!currentUser) return <Navigate to="/" replace />;

  return (
    <div className="grid h-screen grid-cols-1 md:grid-cols-[5rem_1fr] gap-4 p-2 overflow-hidden">
      <div className="hidden md:block">
        <NavigationBar />
      </div>
      <div className="bg-stone-100 rounded-xl m-2 flex flex-col min-h-0 overflow-hidden">
        {/* <h1 className="text-2xl font-bold mb-2">
          Welcome, {currentUser.firstName} {currentUser.lastName}!
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          Role: {currentUser.isAdmin ? "Admin" : "Student"}
        </p> */}
        <Routes>
          <Route path="/" element={<Navigate to="allproblems" />} />
          <Route path="settings" element={<Setting />} />
          <Route path="profile" element={<Profile />} />
          <Route path="report" element={<Report />} />
          <Route path="allproblems" element={<AllProblems />} />
          <Route path="chat/*" element={<AIChat />} />
          <Route path="problems/:pId" element={<ProblemEdit />} />
          <Route path="admin-control/*" element={<AdminControl />} />
          {currentUser.isAdmin && (
            <Route path="admin-control/*" element={<AdminControl />} />
          )}
        </Routes>
      </div>
    </div>
  );
}
