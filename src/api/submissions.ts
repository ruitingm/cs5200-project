/**
 * - fetchSubmissionsApi(accountNumber): GET request to fetch user’s submission history  
 * - submitProblemApi(problemId, data): POST request to submit a SQL solution for a problem  
 */

const BASE_URL = "https://sql-study-room-2025.uw.r.appspot.com";

export async function fetchSubmissionsApi(accountNumber: number) {
  const response = await fetch(
    `${BASE_URL}/submissions/${accountNumber}/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch submissions");
  }

  return response.json();
}

export async function submitProblemApi(
  problemId: number,
  data: { accountNumber: number; submission: string; isCorrect?: boolean }
) {
  const response = await fetch(
    `${BASE_URL}/problems/${problemId}/submit/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        account_number: data.accountNumber,
        submission: data.submission,
        is_correct: data.isCorrect ?? false,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to submit problem");
  }

  return response.json();
}
