const API_BASE_URL = "http://52.201.21.208:3000";

export function getAuthToken() {
    return (
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken") ||
        null
    );
}

export async function apiFetch(path, options = {}) {
    const token = getAuthToken();

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorMsg = "Request failed";
        try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorData.message || errorMsg;
        } catch { }
        throw new Error(errorMsg);
    }

    return response.json();
}
