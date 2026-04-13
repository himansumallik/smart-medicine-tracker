const BASE_URL = "http://13.60.219.80:5000";

export const addMedicine = async (data) => {
  return await fetch(`${BASE_URL}/add-medicine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
};

export const getMedicines = async (userId) => {
  const res = await fetch(`${BASE_URL}/get-medicines/${userId}`);
  return res.json();
};