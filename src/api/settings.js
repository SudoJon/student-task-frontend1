// src/api/settings.js
import { apiFetch } from "../utils/api";

const BASE_URL = "/settings";

export async function getSettings() {
    return apiFetch(BASE_URL);
}

export async function updateSettings(settingsData) {
    return apiFetch(BASE_URL, {
        method: "PUT",
        body: JSON.stringify(settingsData),
    });
}
