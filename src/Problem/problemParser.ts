/**
 * - Parses static JSON data (problem.json) into typed Problem objects for use in the app  
 * - Validates that difficultyTag is one of "Easy" | "Medium" | "Hard"  
 * - Returns an array of Problem objects with correct types  
 */

import type { Problem, ProblemCategory, ProblemDifficultyTag } from "./problemType";
import problemJson from "../Database/problem.json";

export function parseProblems(): Problem[] {
  return problemJson.map((p) => {
    const difficulty = p.difficultyTag;
    if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
      throw new Error(`Invalid difficultyTag: ${difficulty}`);
    }
    return {
      ...p,
      difficultyTag: difficulty as ProblemDifficultyTag,
      conceptTag: p.conceptTag as ProblemCategory[],
    };
  });
}
