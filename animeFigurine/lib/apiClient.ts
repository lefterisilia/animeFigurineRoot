import axios from "axios";

const LOCAL_API = "https://wfnih6gc9g.execute-api.us-east-1.amazonaws.com"; // your PC IP for real device


export const apiClient = axios.create({
    baseURL: LOCAL_API,
    headers: {
        "Content-Type": "application/json",
    },
});


