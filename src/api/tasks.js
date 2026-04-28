import { apiFetch } from "../utils/api";

export function getTasks(query = "") {
    return apiFetch(`/tasks${query}`);
}

export function createTask(task) {
    return apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify(task),
    });
}

export function updateTask(id, task) {
    return apiFetch(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(task),
    });
}

export function deleteTask(id) {
    return apiFetch(`/tasks/${id}`, {
        method: "DELETE",
    });
}
