import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/api/admin/dashboard`)
      .then((res) => setStats(res.data))
      .catch((err) => console.log("Dashboard fetch error:", err));
  }, []);

  const cards = [
    { label: "Products", value: stats.products, icon: "📦" },
    { label: "Orders", value: stats.orders, icon: "📋" },
    { label: "Users", value: stats.users, icon: "👥" },
    { label: "Revenue", value: `₹${Number(stats.revenue).toLocaleString("en-IN")}`, icon: "💰" },
  ];

  return (
    <>
      <h1>Dashboard</h1>

      <div className="dashboard-cards">
        {cards.map((card) => (
          <div className="card" key={card.label}>
            <h3>{card.icon} {card.label}</h3>
            <p>{card.value}</p>
          </div>
        ))}
      </div>
    </>
  );
}
