import axios from "axios";
import SessionCredentialsStore from "../../store/session-credentials";

const BackendApi = axios.create({
    baseURL: "http://localhost:8080",
    timeout: 10000
})

BackendApi.interceptors.request.use((config) => {
    const token = SessionCredentialsStore.get()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});


export default BackendApi;