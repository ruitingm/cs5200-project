/**
 * - Admin UserPanel component to view, search, and delete users
 * - Fetches users from backend API on mount
 * - Allows searching users by first name, last name, or email
 * - Opens DeleteModal to confirm user deletion
 */

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/store";
import DeleteModal from "./DeleteModal";
import { fetchUsersApi } from "../api/users";
import { setUsers } from "../Profile/userSlice";

export default function UserPanel() {
  const [search, setSearch] = useState("");
  const dispatch = useDispatch();
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const users = useSelector((state: RootState) => state.userReducer.users);
  const filteredUsers = users.filter(
    (u) =>
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof users[number] | null>(
    null
  );

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const result = await fetchUsersApi();
        dispatch(setUsers(result));
        setLoadError(null);
      } catch (error) {
        console.log("failed to load users", error);
        setLoadError("Failed to load users.");
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, [dispatch]);

  return (
    <div className="flex flex-col bg-stone-50 border border-stone-200 rounded-xl p-4 shadow-sm h-full min-h-0">
      <div className="flex items-center mb-4">
        <input
          type="text"
          placeholder="Search users..."
          className="w-1/3 px-3 py-2 rounded-lg bg-stone-200 text-stone-700 focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex flex-col flex-1 min-h-0">
        <table className="w-full text-center table-fixed">
          <thead className="bg-stone-200 text-stone-700">
            <tr>
              <th className="p-3">First Name</th>
              <th className="p-3">Last Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
        </table>
        <div className="flex-1 overflow-y-auto">
          {loadingUsers ? (
            <div className="p-4 text-sm text-slate-500">Loading users…</div>
          ) : loadError ? (
            <div className="p-4 text-sm text-rose-600">{loadError}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-sm text-slate-500">
              No users match this search.
            </div>
          ) : (
            <table className="w-full table-fixed text-center">
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.accountNumber || user.email}
                    className="border-b border-stone-200 hover:bg-stone-100"
                  >
                    <td className="p-3">
                      <div className="truncate" title={user.firstName}>
                        {user.firstName}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="truncate" title={user.lastName}>
                        {user.lastName}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="truncate" title={user.email}>
                        {user.email}
                      </div>
                    </td>
                    <td className="p-3">
                      <div
                        className="truncate"
                        title={user.isAdmin ? "Admin" : "Student"}
                      >
                        {user.isAdmin ? "Admin" : "Student"}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center">
                        <button
                        className="text-rose-700 hover:text-rose-800 hover:cursor-pointer"
                        onClick={() => {
                          setSelectedUser(user);
                          setOpenModal(true);
                        }}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
          {selectedUser && (
            <DeleteModal
              openModal={openModal}
              setOpenModal={(open) => {
                if (!open) {
                  setSelectedUser(null);
                }
                setOpenModal(open);
              }}
              user={selectedUser}
            />
          )}
        </div>
      </div>
    </div>
  );
}
