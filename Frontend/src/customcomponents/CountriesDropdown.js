import React, { useEffect, useState } from "react";

export default function CountriesDropdown({
  name,
  value,
  onChange,
  error,
  className,
}) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries"
        );
        const json = await res.json();
        if (json.data) {
          const names = json.data.map((c) => c.country).sort();
          setCountries(names);
        }
      } catch (err) {
        console.error("Failed to fetch countries:", err);
        setCountries([
          "India",
          "United States",
          "United Kingdom",
          "Canada",
          "Australia",
          "Germany",
          "France",
          "Japan",
          "China",
          "Brazil",
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={className || "form-select"}
    >
      <option value="">
        {loading ? "Loading countries..." : "Select Country"}
      </option>
      {countries.map((country) => (
        <option key={country} value={country}>
          {country}
        </option>
      ))}
    </select>
  );
}
