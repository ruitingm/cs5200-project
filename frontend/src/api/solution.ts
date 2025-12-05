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

export async function addSolutionApi(data: {
  pId: number;
  sDescription: string;
}) {
  const response = await fetch(`${API_BASE_URL}/solutions/add/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to add solution for problem ${data.pId}`);
  }

  return await response.json();
}

export async function updateSolutionApi(pId: number, data: any) {
  const res = await fetch(`${API_BASE_URL}/solutions/update/${pId}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    console.error("Update failed", errJson);
    throw new Error("Failed to update solution");
  }

  return res.json();
}
