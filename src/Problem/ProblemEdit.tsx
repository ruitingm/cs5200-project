/**
 * - Displays a specific SQL problem and allows the user to write and submit a SQL solution  
 * - On submit, sends the code to backend via API; shows success or error feedback  
 * - After successful submission, shows whether test passed and reveals the official solution if available  
 */
// TODO
// 1. Add solution
import { Check, X, Undo2 } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router";
import type { RootState } from "../store/store";
import { submitProblemApi } from "../api/submissions";

export default function ProblemEdit() {
  const { pId } = useParams();
  const problems = useSelector(
    (state: RootState) => state.problemReducer.problems
  );
  const problem = problems?.find((p) => Number(pId) === p.pId);
  const solutions = useSelector(
    (state: RootState) => state.solutionReducer.solutions
  );
  const solution = solutions?.find((s) => problem?.pSolutionId === s.sId);
  const currentUser = useSelector(
    (state: RootState) => state.userReducer.currentUser
  );
  console.log(solution);
  const [submitted, setSubmitted] = useState(false);
  const [passed, setPassed] = useState(false);
  const [solutionVisible, setSolutionVisible] = useState(false);
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!currentUser?.accountNumber || !pId) {
      console.log("Missing account number or problem id");
      return;
    }

    if (!code.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitProblemApi(Number(pId), {
        accountNumber: currentUser.accountNumber,
        submission: code,
      });

      setSubmitted(true);
      setPassed(true);
      setSolutionVisible(true);
    } catch (error) {
      console.log("Failed to submit problem", error);
      setSubmitError("Failed to submit answer. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-stone-100 text-stone-800 overflow-hidden">
      <div className="w-1/2 flex flex-col border-r border-stone-200 bg-stone-50 p-6 overflow-y-auto">
        <div className="flex mb-5 text-stone-800">
          <Link to="/main/allproblems">
            <div className="flex items-center justify-center bg-neutral-200 rounded-3xl px-2 text-sm py-1 hover:bg-neutral-300">
              <Undo2 size={17} className="me-2" />
              <span>Back to All Questions</span>
            </div>
          </Link>
        </div>
        <h2 className="text-2xl font-semibold mb-2 ms-2">
          {pId}.&nbsp;{problem?.pTitle}
        </h2>
        <div className="bg-stone-100 rounded-lg p-4 text-md text-stone-700 mb-4 mt-2">
          <pre className="whitespace-pre-wrap wrap-break-word font-sans text-stone-700">
            {problem?.pDescription}
          </pre>
        </div>
        {submitError && (
          <div className="p-3 rounded-lg font-medium mb-4 bg-rose-100 text-rose-800 border border-rose-300">
            {submitError}
          </div>
        )}
        {submitted && !submitError && (
          <div
            className={`p-3 rounded-lg font-medium mb-4 ${
              passed
                ? "bg-emerald-100 text-emerald-900 border border-emerald-400"
                : "bg-rose-100 text-rose-800 border border-rose-400"
            }`}
          >
            {passed && (
              <div className="flex items-center space-x-2 mx-2">
                <Check size={20} className="text-emerald-700" />
                <span>Test Case Passed</span>
              </div>
            )}
            {!passed && (
              <div className="flex items-center space-x-2 mx-2">
                <X size={20} />
                <span>Test Case Failed</span>
              </div>
            )}
          </div>
        )}
        {solutionVisible && (
          <div className="mt-4 border-t border-stone-300 pt-3">
            <h3 className="text-lg font-semibold text-stone-700 mb-2 ms-1">
              Solution
            </h3>
            <pre className="bg-stone-900 text-stone-50 rounded-lg p-4 text-sm overflow-x-auto shadow-inner mb-7">
              {solution?.sDescription}
            </pre>
          </div>
        )}
      </div>
      <div className="w-1/2 flex flex-col bg-stone-200 p-6 relative">
        <h2 className="text-lg font-semibold text-stone-700 mb-3">
          Your SQL Code
        </h2>
        <div className="flex-1 overflow-y-auto rounded-lg shadow-inner">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your SQL query here..."
            className="w-full h-full min-h-[400px] bg-stone-800 text-stone-50 font-mono text-md rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>
        <div className="sticky bottom-0 bg-stone-200 py-3 flex justify-end mb-1">
          <button
            onClick={handleSubmit}
            className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-sm disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
