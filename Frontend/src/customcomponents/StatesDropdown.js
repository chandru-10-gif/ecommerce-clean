import React, { useEffect, useState } from "react";

export default function StatesDropdown({
  name,
  value,
  onChange,
  error,
  className,
}) {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/states",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country: "India" }),
          }
        );
        const json = await res.json();
        if (json.data && json.data.states) {
          const names = json.data.states.map((s) => s.name).sort();
          setStates(names);
        }
      } catch (err) {
        console.error("Failed to fetch Indian states:", err);
        setStates([
          "Andhra Pradesh",
          "Arunachal Pradesh",
          "Assam",
          "Bihar",
          "Chhattisgarh",
          "Goa",
          "Gujarat",
          "Haryana",
          "Himachal Pradesh",
          "Jharkhand",
          "Karnataka",
          "Kerala",
          "Madhya Pradesh",
          "Maharashtra",
          "Manipur",
          "Meghalaya",
          "Mizoram",
          "Nagaland",
          "Odisha",
          "Punjab",
          "Rajasthan",
          "Sikkim",
          "Tamil Nadu",
          "Telangana",
          "Tripura",
          "Uttar Pradesh",
          "Uttarakhand",
          "West Bengal",
          "Delhi",
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, []);

  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={className || "form-select"}
    >
      <option value="">
        {loading ? "Loading states..." : "Select State"}
      </option>
      {states.map((state) => (
        <option key={state} value={state}>
          {state}
        </option>
      ))}
    </select>
  );
}
