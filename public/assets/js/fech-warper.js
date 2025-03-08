const baseURL = "http://localhost:5000/api";
const baseURLGeter = "http://localhost:5000";

const apiRequest = async (endpoint, method = "GET", body = null , ) => {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
            'authorization': `Bearer ${localStorage.getItem('token')}`
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


async function redirect(method , url) {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
            'authorization': `Bearer ${localStorage.getItem('token')}`
        },
    };
    
    try {
        const response = await fetch(`${baseURLGeter}${url}`, options);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("API request error:", error);
        return false
    }
}




function checkBearer() {
    
    // console.log('Authorization:' `Bearer ${localStorage.getItem('token')}`);
}

// مثال استفاده:
// export const getData = () => apiRequest("/data");
// export const postData = (data) => apiRequest("/data", "POST", data);
