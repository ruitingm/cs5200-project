/**
 * - Defines types and constant lists for problems in the app 
 * - Defines problemFilter type used for filtering UI
 */

export const problemDifficulties = ["Easy", "Medium", "Hard"] as const;
export type ProblemDifficultyTag = (typeof problemDifficulties)[number];

export const problemCategories = [
  "Basic",
  "Join",
  "Aggregation",
  "Window Function",
  "Conditional",
  "Set Operation",
  "Subquery",
  "CTE",
] as const;

export type ProblemCategory = (typeof problemCategories)[number];

export type Problem = {
  pId: number;
  pTitle: string;
  difficultyTag: ProblemDifficultyTag;
  conceptTag: ProblemCategory[];
  pDescription: string;
  pSolutionId?: number | null;
  reviewed: boolean;
};

export type ProblemDataset = {
  pId: number;
};

export type problemFilter = "All" | "Reviewed" | "Unreviewed";
