import axios from "axios";

const API_URL = "http://localhost:5000/api/products";


// Get all products
export const getProducts = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

// Get single product
export const getSingleProduct = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};