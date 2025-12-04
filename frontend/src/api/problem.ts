/**
 * - fetchProblemsApi(): sends a GET request to backend to retrieve all problems
 * - Returns parsed JSON of problems on success
 */

import API_BASE_URL from "./config";

export async function fetchProblemsApi() {
  const response = await fetch(`${API_BASE_URL}/problems/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch problems");
  }

  return await response.json();
}
