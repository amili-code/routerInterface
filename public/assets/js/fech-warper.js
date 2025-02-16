const baseURL = "http://localhost:5000/api";

const apiRequest = async (endpoint, method = "GET", body = null) => {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
        },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${baseURL}${endpoint}`, options);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("API request error:", error);
        return false
    }
};

// مثال استفاده:
// export const getData = () => apiRequest("/data");
// export const postData = (data) => apiRequest("/data", "POST", data);
