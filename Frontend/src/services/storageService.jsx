import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";

export const uploadProductImage = async (file) => {
  if (!file) return "";

  const fileName = `${uuidv4()}-${file.name}`;

  const { error } = await supabase.storage
    .from("upload-image")
    .upload(fileName, file);

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("upload-image")
    .getPublicUrl(fileName);

  return data.publicUrl;
};