import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";

export default function Admin() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });
  const [categoryData, setCategoryData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [pendingVendors, setPendingVendors] = useState(0);

  useEffect(() => {
    fetchStats();
    fetchCategoryBreakdown();
    fetchOrderStatusBreakdown();
    fetchPendingVendors();
  }, []);

  const fetchStats = async () => {
    try {
      const { count: products } = await supabase.from("products").select("*", { count: "exact", head: true });
      const { count: orders } = await supabase.from("orders").select("*", { count: "exact", head: true });
      const { count: users } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      const { data: revenueData } = await supabase.from("orders").select("total_amount");
      const revenue = (revenueData || []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
      setStats({ products, orders, users, revenue });
    } catch (err) {
      console.log("Dashboard fetch error:", err);
    }
  };

  const fetchCategoryBreakdown = async () => {
    try {
      const { data } = await supabase.from("products").select("category");
      if (!data) return;
      const counts = {};
      data.forEach((p) => {
        const c = p.category || "Uncategorized";
        counts[c] = (counts[c] || 0) + 1;
      });
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      setCategoryData(sorted);
    } catch (err) {
      console.log("Category fetch error:", err);
    }
  };

  const fetchOrderStatusBreakdown = async () => {
    try {
      const { data } = await supabase.from("orders").select("status");
      if (!data) return;
      const counts = {};
      data.forEach((o) => {
        const s = o.status || "Unknown";
        counts[s] = (counts[s] || 0) + 1;
      });
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      setStatusData(sorted);
    } catch (err) {
      console.log("Status fetch error:", err);
    }
  };

  const fetchPendingVendors = async () => {
    try {
      const { count } = await supabase
        .from("vendor_products")
        .select("*", { count: "exact", head: true })
        .eq("approval_status", "pending");
      setPendingVendors(count || 0);
    } catch (err) {
      console.log("Pending vendors error:", err);
    }
  };

  const maxCategory = Math.max(...categoryData.map(([, v]) => v), 1);
  const maxStatus = Math.max(...statusData.map(([, v]) => v), 1);

  const mainCards = [
    { label: "Total Products", value: stats.products, icon: "📦", color: "#667eea" },
    { label: "Total Orders", value: stats.orders, icon: "📋", color: "#f093fb" },
    { label: "Total Users", value: stats.users, icon: "👥", color: "#4facfe" },
    { label: "Total Revenue", value: `₹${Number(stats.revenue).toLocaleString("en-IN")}`, icon: "💰", color: "#43e97b" },
  ];

  const s = {
    wrapper: { padding: "20px 24px", maxWidth: "1200px", margin: "0 auto" },
    title: { fontSize: "24px", fontWeight: "700", color: "#1a1a2e", textAlign: "center", marginBottom: "28px" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px", marginBottom: "32px" },
    card: (color) => ({
      background: "#fff",
      borderRadius: "14px",
      padding: "22px 20px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      borderLeft: `4px solid ${color}`,
    }),
    cardIcon: { fontSize: "28px", marginBottom: "8px" },
    cardLabel: { fontSize: "13px", color: "#888", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" },
    cardValue: { fontSize: "28px", fontWeight: "700", color: "#1a1a2e", marginTop: "6px" },
    row: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "24px" },
    section: {
      background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    },
    sectionTitle: { fontSize: "15px", fontWeight: "600", color: "#1a1a2e", marginBottom: "16px", paddingBottom: "10px", borderBottom: "1px solid #eee" },
    barRow: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" },
    barLabel: { fontSize: "13px", color: "#555", minWidth: "110px", textTransform: "capitalize", fontWeight: "500" },
    barTrack: { flex: 1, height: "8px", background: "#f0f0f5", borderRadius: "6px", overflow: "hidden" },
    barFill: (w, color) => ({ height: "100%", width: `${w}%`, background: color, borderRadius: "6px", transition: "width 0.6s ease" }),
    barCount: { fontSize: "13px", fontWeight: "600", color: "#1a1a2e", minWidth: "30px", textAlign: "right" },
    subLabel: { fontSize: "12px", color: "#999", marginTop: "4px" },
  };

  const categoryColors = ["#667eea", "#f093fb", "#4facfe", "#43e97b", "#fa709a", "#a18cd1", "#fbc2eb", "#ffecd2"];
  const statusColors = { Pending: "#fbbf24", Packed: "#60a5fa", Shipped: "#a78bfa", "Out For Delivery": "#f472b6", Delivered: "#34d399", Cancelled: "#f87171" };

  return (
    <div style={s.wrapper}>
      <h1 style={s.title}>Dashboard</h1>

      <div style={s.grid}>
        {mainCards.map((c) => (
          <div style={s.card(c.color)} key={c.label}>
            <div style={s.cardIcon}>{c.icon}</div>
            <div style={s.cardLabel}>{c.label}</div>
            <div style={s.cardValue}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={s.row}>
        <div style={s.section}>
          <div style={s.sectionTitle}>Products by Category</div>
          {categoryData.length === 0 && <div style={s.subLabel}>No data</div>}
          {categoryData.map(([cat, count], i) => (
            <div style={s.barRow} key={cat}>
              <span style={s.barLabel}>{cat}</span>
              <div style={s.barTrack}>
                <div style={s.barFill((count / maxCategory) * 100, categoryColors[i % categoryColors.length])} />
              </div>
              <span style={s.barCount}>{count}</span>
            </div>
          ))}
        </div>

        <div style={s.section}>
          <div style={s.sectionTitle}>Orders by Status</div>
          {statusData.length === 0 && <div style={s.subLabel}>No data</div>}
          {statusData.map(([status, count]) => (
            <div style={s.barRow} key={status}>
              <span style={s.barLabel}>{status}</span>
              <div style={s.barTrack}>
                <div style={s.barFill((count / maxStatus) * 100, statusColors[status] || "#667eea")} />
              </div>
              <span style={s.barCount}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...s.section, maxWidth: "320px" }}>
        <div style={s.sectionTitle}>Pending Approvals</div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "36px" }}>⏳</span>
          <div>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "#1a1a2e" }}>{pendingVendors}</div>
            <div style={{ fontSize: "13px", color: "#888" }}>Seller products awaiting review</div>
          </div>
        </div>
      </div>
    </div>
  );
}
