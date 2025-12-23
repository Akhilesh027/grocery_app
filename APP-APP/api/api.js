import axios from "axios";

const API = axios.create({
  baseURL: "https://api.sampurnamart.cloud/api", // Replace with your local IP
});

export default API;
