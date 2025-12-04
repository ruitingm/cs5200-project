/**
 * - loginApi: Sends a POST request to the /auth/login/ endpoint with email and password
 * - signupApi: Sends a POST request to the /auth/signup/ endpoint with user details
 */

import API_BASE_URL from "./config";

export async function loginApi(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  return {
    success: data.success,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    accountNumber: data.accountNumber,
    isStudent: data.isStudent === 1,
    isAdmin: data.isAdmin === 1,
  };
}


export async function signupApi(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_BASE_URL}/auth/signup/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  return result;
}
