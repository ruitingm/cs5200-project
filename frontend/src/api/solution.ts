import API_BASE_URL from "./config";

export async function fetchProblemSolutionApi(pId: number) {
  const response = await fetch(`${API_BASE_URL}/solutions/${pId}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch solution for problem ${pId}`);
  }

  return await response.json();
}
