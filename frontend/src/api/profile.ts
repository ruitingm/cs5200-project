/**
 * - fetchProfileApi(accountNumber): GET request to backend to retrieve user profile data  
 * - updateProfileApi(accountNumber, data): POST request to update user’s first and last name  
 */

import API_BASE_URL from "./config";

export async function fetchProfileApi(accountNumber: number) {
  const response = await fetch(`${API_BASE_URL}/profile/${accountNumber}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }

  return response.json();
}

export async function updateProfileApi(
  accountNumber: number,
  data: { firstName: string; lastName: string }
) {
  const response = await fetch(
    `${API_BASE_URL}/profile/${accountNumber}/update/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update profile");
  }

  return response.json();
}
