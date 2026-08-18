import {
  Wallet,
  ShoppingBag,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import StatCard from "../components/StatCard";
import { getAllPurchases } from "../services/api";

function Dashboard() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAllPurchases();
      setPurchases(res.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Could not load dashboard data. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  // ---- Derived stats from real data ----
  const totalSpent = purchases.reduce((sum, p) => sum + (p.price || 0), 0);
  const totalPurchases = purchases.length;

  const today = new Date();

  const activeWarranties = purchases.filter(
    (p) => p.warrantyExpiryDate && new Date(p.warrantyExpiryDate) > today
  );

  const expiringSoonWarranties = activeWarranties.filter((p) => {
    const daysLeft = Math.ceil(
      (new Date(p.warrantyExpiryDate) - today) / (1000 * 60 * 60 * 24)
    );
    return daysLeft <= 30;
  });

  const upcomingReturns = purchases.filter(
    (p) => p.returnDeadline && new Date(p.returnDeadline) > today
  );

  // Recent purchases: latest 4, sorted by createdAt (already sorted by backend, but just in case)
  const recentPurchases = [...purchases]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  // Action items: things needing attention soon (return deadline or warranty expiring within 7 days)
  const actionItems = purchases
    .map((p) => {
      const items = [];
      if (p.returnDeadline) {
        const daysLeft = Math.ceil(
          (new Date(p.returnDeadline) - today) / (1000 * 60 * 60 * 24)
        );
        if (daysLeft >= 0 && daysLeft <= 7) {
          items.push({
            type: "return",
            name: p.productName,
            label: "Return deadline",
            days: daysLeft,
          });
        }
      }
      if (p.warrantyExpiryDate) {
        const daysLeft = Math.ceil(
          (new Date(p.warrantyExpiryDate) - today) / (1000 * 60 * 60 * 24)
        );
        if (daysLeft >= 0 && daysLeft <= 30) {
          items.push({
            type: "warranty",
            name: p.productName,
            label: "Warranty expiring",
            days: daysLeft,
          });
        }
      }
      return items;
    })
    .flat()
    .slice(0, 3);

  // ---- Monthly spending data for chart (last 6 months) ----
  const getMonthlySpendData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString("en-IN", { month: "short" }),
        total: 0,
      });
    }

    purchases.forEach((p) => {
      if (!p.purchaseDate || !p.price) return;
      const d = new Date(p.purchaseDate);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = months.find((m) => m.key === key);
      if (bucket) bucket.total += p.price;
    });

    return months;
  };

  const monthlySpend = getMonthlySpendData();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Good morning, Simra 👋</h1>
        <p>Here's what's happening with your purchases.</p>
      </div>

      {loading && <p style={{ color: "#64748b" }}>Loading dashboard...</p>}
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}

      {!loading && !error && (
        <>
          <div className="stats-grid">
            <StatCard
              label="Total Spent"
              value={`₹${totalSpent.toLocaleString("en-IN")}`}
              icon={Wallet}
            />
            <StatCard
              label="Total Purchases"
              value={totalPurchases}
              icon={ShoppingBag}
            />
            <StatCard
              label="Active Warranties"
              value={activeWarranties.length}
              change={
                expiringSoonWarranties.length > 0
                  ? `${expiringSoonWarranties.length} expiring soon`
                  : null
              }
              icon={ShieldCheck}
            />
            <StatCard
              label="Returns Upcoming"
              value={upcomingReturns.length}
              icon={RotateCcw}
            />
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Spending Overview</h2>
                <span>Last 6 Months</span>
              </div>

              <div style={{ height: "250px" }}>
                {monthlySpend.every((m) => m.total === 0) ? (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#94a3b8",
                      background: "#f8fafc",
                      borderRadius: "10px",
                    }}
                  >
                    No spending data yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlySpend}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 12, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) =>
                          `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                        }
                      />
                      <Tooltip
                        formatter={(value) => [
                          `₹${value.toLocaleString("en-IN")}`,
                          "Spent",
                        ]}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#4f46e5"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "#4f46e5" }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <h2>Action Required</h2>
                <span>View all</span>
              </div>

              <div className="action-list">
                {actionItems.length === 0 && (
                  <p style={{ color: "#94a3b8", fontSize: "13px" }}>
                    Nothing urgent right now 🎉
                  </p>
                )}

                {actionItems.map((item, idx) => (
                  <div className="action-item" key={idx}>
                    <div
                      className={`action-icon ${
                        item.type === "return" ? "danger" : "warning"
                      }`}
                    >
                      {item.type === "return" ? (
                        <AlertCircle size={18} />
                      ) : (
                        <Clock size={18} />
                      )}
                    </div>
                    <div className="action-info">
                      <h4>{item.name}</h4>
                      <p>{item.label}</p>
                    </div>
                    <span className="action-days">{item.days} days</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="recent-purchases">
            <div className="card-header">
              <h2>Recent Purchases</h2>
              <span>View all</span>
            </div>

            {recentPurchases.length === 0 && (
              <p style={{ color: "#94a3b8", fontSize: "13px", padding: "10px 0" }}>
                No purchases yet — add your first one from the Purchases page.
              </p>
            )}

            {recentPurchases.map((purchase) => (
              <div className="purchase-row" key={purchase._id}>
                <div className="purchase-image">
                  <ShoppingBag size={19} />
                </div>
                <div className="purchase-info">
                  <h4>{purchase.productName}</h4>
                  <p>
                    {purchase.store || "-"} •{" "}
                    {purchase.purchaseDate
                      ? new Date(purchase.purchaseDate).toLocaleDateString(
                          "en-IN",
                          { day: "2-digit", month: "short", year: "numeric" }
                        )
                      : "-"}
                  </p>
                </div>
                <div className="purchase-price">
                  ₹{purchase.price?.toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;