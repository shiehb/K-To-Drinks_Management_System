import api from "../api/api_url"

export async function testApiConnection() {
  try {
    console.log("Testing API connection to:", import.meta.env.VITE_API_URL)
    const response = await api.get("/health-check")
    console.log("API connection successful:", response.data)
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error("API connection failed:", error.message)
    return {
      success: false,
      error: error.message,
      details: error.response?.data || "No response data",
    }
  }
}

