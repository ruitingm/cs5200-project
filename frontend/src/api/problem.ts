/**
 * - fetchProblemsApi(): sends a GET request to backend to retrieve all problems
 * - fetchReviewedProblemsApi(): sends a GET request to backend to retrieve problems filtered by review status
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

/**
 * Fetch problems filtered by review status
 * @param reviewed - true to get reviewed problems, false to get unreviewed problems
 */
export async function fetchReviewedProblemsApi(reviewed: boolean = false) {
  const response = await fetch(
    `${API_BASE_URL}/problems/?reviewed=${reviewed}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch reviewed problems");
  }

  return await response.json();
}
export async function addProblemApi(data: {
  problem_title: string;
  problem_description: string;
  tag_id: number;
}) {
  const res = await fetch("/problems/add/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteProblemApi(problemId: number) {
  const res = await fetch(`${API_BASE_URL}/problems/${problemId}/delete/`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete problem");
  return res.json();
}

export async function updateProblemApi(pId: number, data: any) {
  const res = await fetch(`${API_BASE_URL}/problems/${pId}/update/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    console.error("Update failed", errJson);
    throw new Error("Failed to update problem");
  }

  return res.json();
}
export async function publishProblemApi(id: number) {
  const res = await fetch(`${API_BASE_URL}/problems/${id}/publish/`, {
    method: "POST",
  });
  return res.json();
}
