import { Routes, Route, Navigate } from "react-router-dom";
import NavigationBar from "../Nagivation/Navigation";
import Profile from "../Profile/Profile";
import AIChat from "../AIChat/AIChat";
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
        <Routes>
          <Route path="/" element={<Navigate to="allproblems" />} />
          <Route path="profile" element={<Profile />} />
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
