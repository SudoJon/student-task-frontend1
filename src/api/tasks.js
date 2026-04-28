import { apiFetch } from "../utils/api";

const API_URL = "http://52.201.21.208:3000/tasks";

export function getTasks(query = "") {
    return apiFetch(`${API_URL}${query}`);
}

export function createTask(task) {
    return apiFetch(API_URL, {
        method: "POST",
        body: JSON.stringify(task),
    });
}

export function updateTask(id, task) {
    return apiFetch(`${API_URL}/${id}`, {
        method: "PUT",
        body: JSON.stringify(task),
    });
}

export function deleteTask(id) {
    return apiFetch(`${API_URL}/${id}`, {
        method: "DELETE",
    });
}
