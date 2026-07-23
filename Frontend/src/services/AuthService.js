import axios from "axios";
import { supabase } from "./supabase";

const API = "https://ecommerce-backend-qkpp.onrender.com";

// LOGIN
export const loginUser = async (email, password) => {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) throw error;

  return data;
};

// REGISTER
export const registerUser = async (email, password) => {
  const response = await axios.post(`${API}/register`, {
    email,
    password,
  });

  return response.data;
};

// LOGOUT
export const logoutUser = async () => {
  const { error } =
    await supabase.auth.signOut();

  if (error) throw error;

  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// OTP - Send
export const sendOtp = async (email) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
  });

  if (error) throw error;
  return data;
};

// OTP - Verify
export const verifyOtp = async (email, token) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) throw error;
  return data;
};