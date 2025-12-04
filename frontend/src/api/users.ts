/**
 * - fetchUsersApi: Sends a GET request to the /users/ endpoint to retrieve a list of users  
 * - deleteUserApi: Sends a DELETE request to the /users/{accountNumber}/ endpoint to delete a user
 */

import API_BASE_URL from "./config";

export async function fetchUsersApi() {
  const response = await fetch(`${API_BASE_URL}/users/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
}

export async function deleteUserApi(accountNumber: number) {
  const response = await fetch(`${API_BASE_URL}/users/${accountNumber}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete user");
  }

  return response.json();
}
