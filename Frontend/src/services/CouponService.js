import axios from "axios";

const API_URL = `${process.env.REACT_APP_BASE_URL}/api/coupons`;

export const getCoupons = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.log(error);
    return { coupons: [] };
  }
};

export const createCoupon = async (coupon) => {
  try {
    const response = await axios.post(API_URL, coupon);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateCoupon = async (id, coupon) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, coupon);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteCoupon = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const validateCoupon = async (code, subtotal) => {
  try {
    const response = await axios.post(`${API_URL}/validate`, { code, subtotal });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
