/**
 * Sidebar navigation menu 
 * - Shows different links (Problems, Chat, Reports, Profile, Settings)  
 * - Admin link visible only to admin users  
 * - Displays current user name and role at bottom of sidebar  
 */

import {
  ScrollText,
  MessageCircleMore,
  Settings,
  User,
  ChartColumnIncreasing,
  SlidersHorizontal,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

export default function NavigationBar() {
  const currentUser = useSelector(
    (state: RootState) => state.userReducer.currentUser
  );
  const { pathname } = useLocation();
  const navLinks = [
    { label: "problem", path: "/main/allproblems", icon: ScrollText },
    { label: "chat", path: "/main/chat", icon: MessageCircleMore },
    { label: "report", path: "/main/report", icon: ChartColumnIncreasing },
    { label: "profile", path: "/main/profile", icon: User },
    {
      label: "admin",
      path: "/main/admin-control",
      icon: SlidersHorizontal,
      adminOnly: true,
    },
    { label: "settings", path: "/main/settings", icon: Settings },
  ];

  return (
    <aside
      id="navigation"
      className="fixed left-2 top-4 bottom-4 w-20 flex-col justify-between items-center rounded-xl bg-stone-200 shadow-lg hidden md:block"
    >
      <nav className="flex flex-col items-center space-y-8 pb-8">
        <Link to="/main/allproblems">
          <img
            src="/images/sql-study-room-logo.png"
            alt="logo"
            className="hover:cursor-pointer"
          />
        </Link>
        {/* {navLinks
          .filter((link) => !link.adminOnly || currentUser?.isAdmin)
          .map((link) => {
            const isActive = pathname.includes(link.label); */}
        {navLinks
          .filter((link) => !link.adminOnly || currentUser?.isAdmin)
          .map((link) => {
            const isActive = pathname.startsWith(link.path);

            return (
              <Link
                key={link.label}
                to={link.path}
                className="flex flex-col items-center justify-center rounded-sm text-stone-800"
              >
                <div>
                  <link.icon
                    size={34}
                    strokeWidth={isActive ? 3 : 2}
                    className="text-stone-500 transition-all duration-200"
                  />
                </div>
                <div>{link.label}</div>
              </Link>
            );
          })}
      </nav>
      {/* User Info */}
      <div className="mb-4 text-center text-xs text-stone-700">
        {currentUser && (
          <>
            <div>
              {currentUser.firstName} {currentUser.lastName}
            </div>
            <div className="text-stone-500 text-[10px]">
              {currentUser.isAdmin ? "Admin" : "Student"}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
