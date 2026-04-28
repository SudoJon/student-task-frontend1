import { apiFetch } from "../utils/api";

export const getNotes = () => apiFetch("/notes");

export const createNote = (note) =>
    apiFetch("/notes", {
        method: "POST",
        body: JSON.stringify(note),
    });

export const updateNote = (id, note) =>
    apiFetch(`/notes/${id}`, {
        method: "PUT",
        body: JSON.stringify(note),
    });

export const deleteNote = (id) =>
    apiFetch(`/notes/${id}`, {
        method: "DELETE",
    });
