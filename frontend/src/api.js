const BASE_URL = "http://43.205.130.165";

export const addMedicine = async (data) => {
  const res = await fetch(`${BASE_URL}/add-medicine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  return res.json();
};

export const getMedicines = async (userId) => {
  const res = await fetch(`${BASE_URL}/medicines/${userId}`);
  return res.json();
};