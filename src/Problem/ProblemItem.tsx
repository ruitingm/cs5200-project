/**
 * Represents one problem in the problem list  
 * - Renders a link to the problem’s detail/edit page
 * - Shows problem ID, title, difficulty, and a “solved” checkmark icon  
 */

export interface ProblemItemProps {
  pId: number;
  pTitle: string;
  difficultyTag: ProblemDifficultyTag;
  conceptTags?: string[];
  solved?: boolean;
};

import { Check } from "lucide-react";
import { Link } from "react-router";
import type { ProblemDifficultyTag } from "./problemType";

export default function ProblemItem({
  pId,
  pTitle,
  difficultyTag,
  conceptTags = [],
  solved = false,
}: ProblemItemProps) {
  const getDifficultyColor = () => {
    switch (difficultyTag) {
      case "Easy":
        return "text-emerald-600";
      case "Medium":
        return "text-amber-500";
      case "Hard":
        return "text-rose-600";
      default:
        return "text-gray-700";
    }
  };

  return (
    <Link
      to={`/main/problems/${pId}`}
      className="flex justify-between items-center ps-2 pe-5 py-3 rounded-lg transition odd:bg-stone-50 even:bg-stone-200 mb-1 hover:cursor-pointer"
    >
      <div className="w-5 flex justify-center me-2">
        {solved && <Check size={15} className="text-emerald-700" />}
      </div>

      <div className="flex flex-col flex-1">
        <span className="font-medium truncate">
          {pId}. {pTitle}
        </span>
        {conceptTags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-2">
            {conceptTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-stone-300 text-xs rounded-full text-stone-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 text-sm">
        <span className={`${getDifficultyColor()} font-semibold`}>
          {difficultyTag}
        </span>
      </div>
    </Link>
  );
}
