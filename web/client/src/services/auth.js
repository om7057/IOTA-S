const API_URL = "http://localhost:5000/api/users";

export const registerUser = async (user) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return res.json();
};

export const fetchUser = async (clerkId) => {
  const res = await fetch(`${API_URL}/${clerkId}`);
  return res.json();
};
