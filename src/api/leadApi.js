import axios from "./axios";

export const getLead = () => axios.get("/leads");
export const addLead = (value) => axios.post("/leads/add", { value });
export const updateTarget = (newTarget) => axios.put("/leads/target", { newTarget });
export const undoLead = () => axios.post("/leads/undo");
export const redoLead = () => axios.post("/leads/redo");
export const resetLead = () => axios.post("/leads/reset");