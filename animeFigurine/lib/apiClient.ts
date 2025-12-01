import axios from "axios";

const LOCAL_API = "http://192.168.10.10:4000"; // your PC IP for real device


export const apiClient = axios.create({
    baseURL: LOCAL_API,
    headers: {
        "Content-Type": "application/json",
    },
});


