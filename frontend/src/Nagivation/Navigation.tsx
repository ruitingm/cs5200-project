import {
  ScrollText,
  MessageCircleMore,
  User,
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
    { label: "profile", path: "/main/profile", icon: User },
    {
      label: "admin",
      path: "/main/admin-control",
      icon: SlidersHorizontal,
      adminOnly: true,
    },
  ];

  return (
    <aside
      id="navigation"
      className="fixed left-2 top-4 bottom-4 w-20 hidden md:flex flex-col rounded-xl bg-stone-200 shadow-lg"
    >
      <nav className="flex-1 flex flex-col items-center space-y-8 pt-4">
        <Link to="/main/allproblems">
          <img
            src="/images/sql-study-room-logo.png"
            alt="logo"
            className="hover:cursor-pointer"
          />
        </Link>

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
                <div className="text-xs">{link.label}</div>
              </Link>
            );
          })}
      </nav>

      <div className="mt-auto mb-4 text-center text-xs text-stone-700">
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
