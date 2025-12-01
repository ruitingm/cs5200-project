export async function fetchProblemsApi() {
  const response = await fetch(
    "https://sql-study-room-2025.uw.r.appspot.com/problems/",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch problems");
  }

  return await response.json();
}
