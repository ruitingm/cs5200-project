/**
 * Lets admin edit an existing SQL problem
 * - Loads the problem from Redux store by pId
 * - Uses local state (useState) for form fields
 * - On “Save” click, dispatches updates to store and returns to the list view
 * 
 * TODO:
 * Need to connect to bakcend, right now only updates Redux store.
 * Creates a random temporary problem ID - when connected to backend, replace with the real ID returned by the server.
 */

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { updateProblem } from "../Problem/problemSlice";
import {
  problemCategories,
  problemDifficulties,
  type Problem,
  type ProblemCategory,
  type ProblemDifficultyTag,
} from "../Problem/problemType";
import { addSolution } from "../Problem/solutionSlice";
export default function ProblemEditor({
  pId,
  onBack,
}: {
  pId: number;
  onBack: () => void;
}) {
  const dispatch = useDispatch();
  const problems = useSelector(
    (state: RootState) => state.problemReducer.problems
  );
  const problem = problems?.find((p) => p.pId === pId);
  if (!problem) {
    return (
      <div className="text-stone-700 p-6">
        <p>Problem not found.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-stone-300 hover:bg-stone-400 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }
  const [title, setTitle] = useState(problem.pTitle);
  const [description, setDescription] = useState(problem.pDescription);
  const [difficulty, setDifficulty] = useState<ProblemDifficultyTag>(
    problem.difficultyTag
  );
  const [concepts, setConcepts] = useState<ProblemCategory[]>([
    ...problem.conceptTag,
  ]);
  const solutions = useSelector(
    (state: RootState) => state.solutionReducer.solutions
  );
  const pSolution = solutions?.find((s) => s.sId === problem.pSolutionId);
  const [solution, setSolution] = useState<string>(
    pSolution ? pSolution.sDescription : ""
  );
  const toggleConcept = (tag: ProblemCategory) => {
    setConcepts((prev) =>
      prev.includes(tag) ? prev.filter((c) => c !== tag) : [...prev, tag]
    );
  };
  const handleSave = () => {
    const tempSolutionId = Math.floor(Math.random() * 1000000);
    dispatch(
      addSolution({
        sId: tempSolutionId,
        sDescription: solution,
      })
    );
    const updatedProblem: Problem = {
      ...problem,
      pTitle: title,
      difficultyTag: difficulty,
      conceptTag: concepts,
      pDescription: description,
      pSolutionId: tempSolutionId,
      reviewed: true,
    };
    dispatch(updateProblem(updatedProblem));
    onBack();
  };
  return (
    <div className="bg-white rounded-xl shadow-md p-6 h-[600px] overflow-y-auto text-stone-800">
      <h2 className="text-2xl font-semibold mb-6">Edit Problem</h2>
      <div className="mb-4">
        <label className="text-sm font-medium text-stone-600">Problem ID</label>
        <input
          type="text"
          value={problem.pId}
          disabled
          className="w-full mt-1 bg-stone-200 text-stone-700 rounded px-3 py-2 cursor-not-allowed"
        />
      </div>
      <div className="mb-4">
        <label className="text-sm font-medium text-stone-600">
          Problem Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mt-1 border border-stone-300 rounded px-3 py-2 focus:ring-2 focus:ring-stone-300 focus:outline-none"
        />
      </div>
      <div className="mb-4">
        <label className="text-sm font-medium text-stone-600">Difficulty</label>
        <div className="flex gap-2 mt-2">
          {problemDifficulties.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-4 py-1 rounded-full border text-sm font-medium transition
              ${
                difficulty === d
                  ? "bg-stone-700 text-white border-stone-700"
                  : "bg-stone-200 text-stone-700 border-stone-300 hover:bg-stone-300"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="text-sm font-medium text-stone-600">Concepts</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {problemCategories.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleConcept(tag)}
              className={`px-3 py-1 rounded-full border text-sm
              ${
                concepts?.includes(tag)
                  ? "bg-stone-700 text-white border-stone-700"
                  : "bg-stone-200 text-stone-700 border-stone-300 hover:bg-stone-300"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-stone-600">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          className="w-full mt-1 border border-stone-300 rounded px-3 py-2 focus:ring-2 focus:ring-stone-300 focus:outline-none"
        />
      </div>
      <div className="mb-6">
        <label className="text-sm font-medium text-stone-600">Solution</label>
        <textarea
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
          rows={6}
          className="w-full mt-1 border border-stone-300 rounded px-3 py-2 focus:ring-2 focus:ring-stone-300 focus:outline-none"
        />
      </div>
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={onBack}
          className="px-5 py-2 bg-neutral-300 text-stone-800 rounded-md hover:bg-neutral-400 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-5 py-2 bg-sky-700 text-white rounded-md hover:bg-sky-800 transition"
        >
          Save
        </button>
      </div>
    </div>
  );
}
