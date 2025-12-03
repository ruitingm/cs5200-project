/**
 * Administrator dashboard component for SQL Study Room
 * - A tabbed interface so admin can switch between user and problem management
 * - Manages internal state
 *  > which tab is active
 *  > which mode in the problems tab: view/create/edit  
 *  > which problem is selected for creating/editing  
 * - Conditionally renders different panels/components
 *  > UserPanel when “users” tab selected  
 *  > ProblemPanel when “problems” tab and list mode  
 *  > ProblemCreation or ProblemEditor when creating/editing 
 * 
 * TODO:
 * Need backend API calls for user and problem operations (instead of just Redux-local actions).
 * Need loading/error message if backend call fails
 */

import { useState } from "react";
import UserPanel from "./UserPanel";
import ProblemPanel from "./ProblemPanel";
import ProblemEditor from "./ProblemEditor";
import ProblemCreation from "./ProblemCreation";

export default function AdminControl() {
  const [tab, setTab] = useState<"users" | "problems">("users");
  const [problemViewMode, setProblemViewMode] = useState<
    "list" | "create" | "edit"
  >("list");
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(
    null
  );
  const resetProblemView = () => {
    setProblemViewMode("list");
    setSelectedProblemId(null);
  };
  return (
    <div className="w-full h-full flex flex-col bg-stone-100 text-stone-800 p-6 min-h-0">
      <h1 className="text-3xl font-semibold mb-6">Administrator Dashboard</h1>
      <div className="flex gap-4 border-b border-stone-300 pb mb-6">
        <button
          onClick={() => {
            setTab("users");
            resetProblemView();
          }}
          className={`px-4 py-2 font-medium rounded-t-lg ${
            tab === "users"
              ? "bg-stone-300 text-stone-900"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          Users
        </button>
        <button
          onClick={() => {
            setTab("problems");
            resetProblemView();
          }}
          className={`px-4 py-2 font-medium rounded-t-lg ${
            tab === "problems"
              ? "bg-stone-300 text-stone-900"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          Problems
        </button>
      </div>
      {tab === "users" && <UserPanel />}
      {tab === "problems" && (
        <>
          {problemViewMode === "list" && (
            <ProblemPanel
              onCreate={(id: number) => {
                setProblemViewMode("create");
                setSelectedProblemId(id);
              }}
              onEdit={(id: number) => {
                setSelectedProblemId(id);
                setProblemViewMode("edit");
              }}
            />
          )}
          {problemViewMode === "create" && selectedProblemId && (
            <ProblemCreation
              pId={selectedProblemId}
              onBack={resetProblemView}
            />
          )}
          {problemViewMode === "edit" && selectedProblemId && (
            <ProblemEditor pId={selectedProblemId} onBack={resetProblemView} />
          )}
        </>
      )}
    </div>
  );
}
