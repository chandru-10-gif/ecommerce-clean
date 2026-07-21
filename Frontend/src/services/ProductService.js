import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Get products with pagination + search
export const getProducts = async (page = 1, limit = 8, search = "") => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        page,
        limit,
        search,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);

    return {
      products: [],
      totalPages: 1,
      total: 0,
    };
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