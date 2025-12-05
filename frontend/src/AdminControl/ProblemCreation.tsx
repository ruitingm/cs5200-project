/**
 * Lets admin review and publish a new or edited SQL problem
 * - Loads the problem from Redux store by pId
 * - Renders a form letting the admin set or edit different fields
 * - Maintains internal form state using React’s useState hook
 * - On “Publish” button click:
 *  > Creates a temporary solution ID
 *  > Dispatches the addSolution action to Redux
 *  > Creates an updated Problem object
 *  > Dispatches the updateProblem action to Redux
 *  > Calls onBack() to go back to the problem list view
 * - Renders the form inside a scrollable panel
 *
 * TODO:
 * Need backend API calls, right now it only updates Redux store.
 * Creates a random temporary problem ID - when connected to backend, replace with the real ID returned by the server.
 * Need loading/error message if backend call fails.
 */

import * as react from "react";
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
import { updateProblemApi } from "../api/problem";
import { publishProblemApi } from "../api/problem";
import { fetchTagsApi } from "../api/tags";

export default function ProblemCreation({
  pId,
  onBack,
}: {
  pId: number;
  onBack: () => void;
}) {
  const [tags, setTags] = react.useState<
    {
      tag_id: number;
      difficulty: string;
      concept: string;
    }[]
  >([]);
  react.useEffect(() => {
    const loadTags = async () => {
      try {
        const result = await fetchTagsApi(); // <-- 你已有的 API
        setTags(result);
      } catch (error) {
        console.error("Failed to load tags", error);
      }
    };

    loadTags();
  }, []);
  const dispatch = useDispatch();
  const problems = useSelector(
    (state: RootState) => state.problemReducer.problems
  );
  const problem = problems?.find((p) => p.pId === pId);
  // const TAG_MAP: Record<string, number> = {
  //   "Beginner|JOIN": 1,
  //   "Beginner|GROUP BY": 2,
  //   "Intermediate|JOIN": 3,
  //   "Intermediate|GROUP BY": 4,
  //   "Advanced|JOIN": 5,
  //   "Advanced|GROUP BY": 6,
  // };
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

  const [title, setTitle] = react.useState(problem.pTitle);
  const [description, setDescription] = react.useState(problem.pDescription);
  const [difficulty, setDifficulty] = react.useState<ProblemDifficultyTag>(
    problem.difficultyTag
  );
  const [concepts, setConcepts] = react.useState<ProblemCategory[]>([
    ...problem.conceptTag,
  ]);
  const [solution, setSolution] = react.useState("");
  const toggleConcept = (tag: ProblemCategory) => {
    setConcepts((prev) =>
      prev.includes(tag) ? prev.filter((c) => c !== tag) : [...prev, tag]
    );
  };
  const computeTagId = () => {
    if (tags.length === 0) {
      console.warn("Tags have not loaded yet!");
      return null;
    }

    if (!difficulty || concepts.length === 0) {
      console.warn("Difficulty or concept not selected.");
      return null;
    }

    const selectedConcept = concepts[0]; // 单选或多选取第一个概念

    const match = tags.find(
      (t) =>
        t.difficulty.toLowerCase() === difficulty.toLowerCase() &&
        t.concept.toLowerCase() === selectedConcept.toLowerCase()
    );

    if (!match) {
      console.warn("No matching tag found for:", difficulty, selectedConcept);
      return null;
    }

    return match.tag_id;
  };

  const handleSave = async () => {
    try {
      // 1. 先保存 Solution 到 Redux
      const tempSolutionId = Math.floor(Math.random() * 1000000);
      dispatch(
        addSolution({
          sId: tempSolutionId,
          sDescription: solution,
        })
      );

      // 2. 计算 tagId
      const tagId = computeTagId();
      if (!tagId) {
        alert("Cannot determine Tag ID. Check difficulty & concept.");
        return;
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        tagId: tagId,
        solutionId: tempSolutionId,
      };
      console.log("Update payload:", payload);

      // 3. 调用更新 Problem 的 API（后端的 /problems/<pid>/update/）
      await updateProblemApi(pId, payload);

      // 4. 调用 publish API，把 Review_status 置为 1
      await publishProblemApi(pId);

      // 5. 更新前端 Redux 状态
      dispatch(
        updateProblem({
          ...problem,
          pTitle: title,
          pDescription: description,
          difficultyTag: difficulty,
          conceptTag: concepts,
          pSolutionId: tempSolutionId,
          reviewed: true,
        })
      );

      alert("Problem published successfully!");
      onBack();
    } catch (err) {
      console.error(err);
      alert("Failed to publish problem");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 h-[600px] overflow-y-auto text-stone-800">
      <h2 className="text-2xl font-semibold mb-6">Review & Publish Problem</h2>
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
              className={`px-3 py-1 rounded-full border text-sm ${
                concepts.includes(tag)
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
          placeholder="Add solution here..."
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
          className="px-5 py-2 bg-rose-800 text-white rounded-md hover:bg-rose-900 transition"
        >
          Publish
        </button>
      </div>
    </div>
  );
}
