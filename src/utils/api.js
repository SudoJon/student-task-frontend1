export function getAuthToken() {
    return (
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken") ||
        null
    );
}

export async function apiFetch(url, options = {}) {
    const token = getAuthToken();

    /* ⭐ FIXED: Explicit Header assignment */
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorMsg = "Request failed";
        try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (err) {
            // Catch cases where the backend doesn't return JSON cleanly
        }
        throw new Error(errorMsg);
    }

    return response.json();
}