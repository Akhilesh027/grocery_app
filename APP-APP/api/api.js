import axios from "axios";

const API = axios.create({
  baseURL: "https://grocery-c3c0.onrender.com/api", // Replace with your local IP
});

export default API;
