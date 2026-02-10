import { API_CONFIG } from '../config/api';

export const registerUser = async (user) => {
  const res = await fetch(API_CONFIG.USERS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return res.json();
};

export const fetchUser = async (clerkId) => {
  const res = await fetch(API_CONFIG.USER(clerkId));
  return res.json();
};
