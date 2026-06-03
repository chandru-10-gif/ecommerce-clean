import axios from "axios";

 const API_URL = "https://fakestoreapi.com";



console.log(API_URL, "api url ");

export const getProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/products`);

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getSingleProduct = async (id) => {
  try {
    // // delay API response by 3 sec
    // await new Promise((resolve) =>
    //   setTimeout(resolve,3000)
    // );

    const response = await axios.get(`${API_URL}/products/${id}`);

    return response.data;
  } catch (error) {
    console.log(error);

    return null;
  }
};
