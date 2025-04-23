import axios from "./axios";

export const login = async (email, password) => {
    return axios.post("/auth/login", { email, password });
};

export const logout = async () => {
    return axios.post("/auth/logout");
};

export const refresh = async () => {
    return axios.post("/auth/refresh");
};
