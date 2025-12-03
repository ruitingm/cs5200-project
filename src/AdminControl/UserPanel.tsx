/**
 * Displays a searchable list of all users 
 * - Lets admin filter users 
 * - Shows a delete button next to each user that opens DeleteModal
 * - Uses Redux store to get the current list of users via useSelector
 * 
 * TODO:
 * Backend integrtion
 */

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import DeleteModal from "./DeleteModal";

export default function UserPanel() {
  const [search, setSearch] = useState("");
  const users = useSelector((state: RootState) => state.userReducer.users);
  const filteredUsers = users.filter(
    (u) =>
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );
  const [openModal, setOpenModal] = useState(false);
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
          <table className="w-full table-fixed text-center">
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.userId}
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
                        onClick={() => setOpenModal(true)}
                      >
                        <Trash2 size={20} />
                      </button>
                      {openModal && (
                        <DeleteModal
                          openModal={openModal}
                          setOpenModal={setOpenModal}
                          user={user}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
