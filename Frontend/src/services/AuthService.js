import axios from "axios";
import { supabase } from "./supabase";

const API = "http://localhost:5000/api";

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