import axios from "axios";

const instance = axios.create({
    // baseURL: "http://api.muctieuads.online/api",
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
});

export default instance;
