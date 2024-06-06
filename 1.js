const axios = require("axios");

async function send(data) {
  try {
    const response = await axios.post("http://localhost:5000", data);
    return response.data;
  } catch (error) {
    console.error("Error sending request:", error);
    throw error;
  }
}

// Example usage:
(async () => {
  const data = { key: "are you working" }; // Replace with the data you want to send
  try {
    const response = await send(data);
    console.log("Response:", response);
  } catch (error) {
    console.error("Error:", error);
  }
})();
