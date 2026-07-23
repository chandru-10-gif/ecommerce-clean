import axios from "axios";

const API_URL = `${process.env.REACT_APP_BASE_URL}/api/products`;

// Get products with pagination + search + filters
export const getProducts = async (page = 1, limit = 8, search = "", filters = {}) => {
  try {
    const params = {
      page,
      limit,
      search,
    };

    if (filters.category) params.category = filters.category;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.sort) params.sort = filters.sort;
    if (filters.inStock) params.inStock = filters.inStock;

    const response = await axios.get(API_URL, { params });

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
