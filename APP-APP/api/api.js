import axios from "axios";

const API = axios.create({
  baseURL: "http://31.97.233.212:5000/api", // Replace with your local IP
});

export default API;
