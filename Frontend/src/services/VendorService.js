import axios from "axios";

const API = process.env.REACT_APP_BASE_URL;

export const vendorLogin = async (email, password) => {
  const res = await axios.post(`${API}/api/vendor/login`, { email, password });
  return res.data;
};

export const vendorRegister = async (data) => {
  const res = await axios.post(`${API}/api/vendor/register`, data);
  return res.data;
};

export const getVendorProducts = async (vendorId) => {
  const res = await axios.get(`${API}/api/vendor/products`, {
    params: { vendor_id: vendorId },
  });
  return res.data;
};

export const getVendorProduct = async (id) => {
  const res = await axios.get(`${API}/api/vendor/products/${id}`);
  return res.data;
};

export const addVendorProduct = async (product) => {
  const res = await axios.post(`${API}/api/vendor/products`, product);
  return res.data;
};

export const updateVendorProduct = async (id, product) => {
  const res = await axios.put(`${API}/api/vendor/products/${id}`, product);
  return res.data;
};

export const deleteVendorProduct = async (id) => {
  const res = await axios.delete(`${API}/api/vendor/products/${id}`);
  return res.data;
};

export const updateVendorStock = async (id, data) => {
  const res = await axios.put(`${API}/api/vendor/products/${id}/stock`, data);
  return res.data;
};

export const getVendorStats = async (vendorId) => {
  const res = await axios.get(`${API}/api/vendor/stats`, {
    params: { vendor_id: vendorId },
  });
  return res.data;
};
