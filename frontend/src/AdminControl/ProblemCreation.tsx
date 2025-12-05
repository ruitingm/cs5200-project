import * as react from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { updateProblem } from "../Problem/problemSlice";
import {
  problemCategories,
  problemDifficulties,
  type ProblemCategory,
  type ProblemDifficultyTag,
} from "../Problem/problemType";

import { updateProblemApi } from "../api/problem";
import { publishProblemApi } from "../api/problem";
import { fetchTagsApi } from "../api/tags";
import { addSolutionApi } from "../api/solution";

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
        const result = await fetchTagsApi();
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

    const selectedConcept = concepts[0];

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
      if (!solution.trim()) {
        alert("Please provide a solution description.");
        return;
      }
      await addSolutionApi({ pId, sDescription: solution });

      const tagId = computeTagId();
      if (!tagId) {
        alert("Cannot determine Tag ID. Check difficulty & concept.");
        return;
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        tagId: tagId,
      };
      console.log("Update payload:", payload);

      await updateProblemApi(pId, payload);
      await publishProblemApi(pId);

      dispatch(
        updateProblem({
          ...problem,
          pTitle: title,
          pDescription: description,
          difficultyTag: difficulty,
          conceptTag: concepts,
          pSolutionId: undefined,
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
