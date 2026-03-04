import axios from "axios";

const API_URL = "http://localhost:3000/api/products";

export const getProducts = () => axios.get(API_URL);
export const addProduct = (productData) => axios.post(API_URL, productData);
