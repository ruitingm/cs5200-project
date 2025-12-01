const BASE_URL = "https://sql-study-room-2025.uw.r.appspot.com";

export async function fetchProfileApi(accountNumber: number) {
  const response = await fetch(`${BASE_URL}/profile/${accountNumber}/`, {
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
    `${BASE_URL}/profile/${accountNumber}/update/`,
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
