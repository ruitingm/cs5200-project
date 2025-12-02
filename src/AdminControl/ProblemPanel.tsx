/**
 * Shows a list of problems filtered by review status All/Reviewed/Unreviewed
 * - Lets admin view, edit, or delete each problem
 * - Uses Redux store via useSelector to get current list of problems
 * - Includes DeleteModal to confirm deletions
 * - Calls onCreate or onEdit to trigger creation or edit
 * 
 * TODO:
 * Backend integration
 */

import { useState } from "react";
import { Eye, PencilLine, Trash2 } from "lucide-react";
import type { problemFilter } from "../Problem/problemType";
import type { RootState } from "../store/store";
import { useSelector } from "react-redux";
import DeleteModal from "./DeleteModal";

export default function ProblemPanel({
  onCreate,
  onEdit,
}: {
  onCreate: (id: number) => void;
  onEdit: (pId: number) => void;
}) {
  const [filter, setFilter] = useState<problemFilter>("All");
  const problems = useSelector(
    (state: RootState) => state.problemReducer.problems
  );
  const filteredProblems = problems?.filter((p) => {
    if (filter === "All") return true;
    if (filter === "Reviewed") return p.reviewed === true;
    return p.reviewed === false;
  });
  const filterOptions: problemFilter[] = ["All", "Reviewed", "Unreviewed"];
  const [openModal, setOpenModal] = useState(false);
  
  return (
    <div className="flex flex-col flex-1 bg-stone-50 border border-stone-200 rounded-xl p-4 shadow-sm min-h-0">
      <div className="flex gap-3 mb-4">
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as problemFilter)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              filter === f
                ? "bg-sky-700 text-white"
                : "bg-stone-300 text-stone-700 hover:bg-stone-400"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="flex flex-col flex-1 min-h-0">
        <table className="w-full text-center table-fixed">
          <thead className="bg-stone-200 text-stone-700">
            <tr>
              <th className="p-3">Problem ID</th>
              <th className="p-3">Problem Title</th>
              <th className="p-3">Reviewed Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
        </table>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-center table-fixed">
            <tbody>
              {filteredProblems?.map((p) => (
                <tr
                  key={p.pId}
                  className="border-b border-stone-200 hover:bg-stone-100"
                >
                  <td className="p-3">
                    <div className="truncate" title={p.pId.toString()}>
                      {p.pId}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="truncate" title={p.pTitle}>
                      {p.pTitle}
                    </div>
                  </td>
                  <td className="p-3">
                    <div
                      className="truncate"
                      title={p.reviewed ? "Reviewed" : "Not Reviewed"}
                    >
                      {p.reviewed ? (
                        <span className="text-emerald-700">Reviewed</span>
                      ) : (
                        <span className="text-rose-700">Not Reviewed</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center items-center space-x-3">
                      {!p.reviewed && (
                        <div>
                          <button
                            className="text-sky-700 hover:text-sky-900 hover:cursor-pointer"
                            onClick={() => onCreate(p.pId)}
                          >
                            <Eye size={20} />
                          </button>
                        </div>
                      )}
                      {p.reviewed && (
                        <div>
                          <button
                            className="text-emerald-700 hover:text-emerald-900 hover:cursor-pointer"
                            onClick={() => onEdit(p.pId)}
                          >
                            <PencilLine size={20} />
                          </button>
                        </div>
                      )}
                      <div>
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
                            problem={p}
                          />
                        )}
                      </div>
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
