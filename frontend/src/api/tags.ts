/**
 * - fetchTagsApi(): GET request to retrieve all tag data from backend
 * - fetchTagProblemsApi(tagId): GET request to fetch all problems associated with a specific tag
 */

import API_BASE_URL from "./config";

export async function fetchTagsApi() {
  const response = await fetch(`${API_BASE_URL}/tags/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tags");
  }

  return response.json();
}

export async function fetchTagProblemsApi(tagId: number) {
  const response = await fetch(`${API_BASE_URL}/tags/${tagId}/problems/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tag problems");
  }

  return response.json();
}

export async function fetchFilteredProblemsApi(tagId: number) {
  const response = await fetch(`${API_BASE_URL}/tags/${tagId}/problems/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch filtered problems");
  }

  return response.json();
}
