export async function loginApi(email: string, password: string) {
  const response = await fetch(
    "https://sql-study-room-2025.uw.r.appspot.com/auth/login/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }
  );

  const data = await response.json();

  return {
    success: data.success,
    email: data.email,
    firstName: data.firstName, // ← ✔ 后端就是 camelCase
    lastName: data.lastName,
    accountNumber: data.accountNumber,
    isStudent: data.isStudent === 1,
    isAdmin: data.isAdmin === 1,
  };
}
