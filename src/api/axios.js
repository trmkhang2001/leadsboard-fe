import axios from "axios";

const instance = axios.create({
    baseURL: "https://api.muctieuads.online/api",
    // baseURL: "http://localhost:5000/api",
    withCredentials: true,
});

export default instance;
