import {
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  ShieldCheck,
  RotateCcw,
  Store,
  Calendar,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { getAllPurchases } from "../services/api";
import { getWarrantyStatus, getReturnStatus } from "../utils/dateHelper";

const CATEGORY_COLORS = {
  Electronics: "#2563eb",
  Clothing: "#f59e0b",
  Home: "#16a34a",
  "Personal Care": "#a855f7",
  Other: "#94a3b8",
};

const STATUS_COLORS = {
  Active: "#16a34a",
  "Expiring Soon": "#d97706",
  Expired: "#dc2626",
  "Not Applicable": "#94a3b8",
};

function Analytics() {
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
      if (res.success) {
        setPurchases(res.data);
      } else {
        setError(res.message || "Failed to load analytics.");
      }
    } catch (err) {
      console.error(err);
      setError("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-loading">Loading analytics...</div>;
  }

  if (error) {
    return (
      <div className="page-error">
        <p>{error}</p>
        <button onClick={fetchData}>Retry</button>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="placeholder-page">
        <TrendingUp size={40} />
        <h2>No data yet</h2>
        <p>Add a few purchases to see your spending analytics.</p>
      </div>
    );
  }

  // ---------- TOP STATS ----------
  const totalSpent = purchases.reduce((sum, p) => sum + (p.price || 0), 0);
  const totalPurchases = purchases.length;
  const avgSpend = Math.round(totalSpent / totalPurchases);

  const activeWarranties = purchases.filter(
    (p) => getWarrantyStatus(p.warrantyExpiryDate) === "Active"
  ).length;

  // ---------- CATEGORY BREAKDOWN (Pie) ----------
  const categoryMap = {};
  purchases.forEach((p) => {
    const cat = p.category || "Other";
    categoryMap[cat] = (categoryMap[cat] || 0) + (p.price || 0);
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  // ---------- MONTHLY SPEND (Bar) ----------
  const monthMap = {};
  purchases.forEach((p) => {
    if (!p.purchaseDate) return;
    const d = new Date(p.purchaseDate);
    const key = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
    monthMap[key] = (monthMap[key] || 0) + (p.price || 0);
  });
  const monthlyData = Object.entries(monthMap)
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => new Date("1 " + a.month) - new Date("1 " + b.month));

  // ---------- WARRANTY STATUS (Pie) ----------
  const warrantyStatusMap = {};
  purchases.forEach((p) => {
    const status = p.warrantyExpiryDate ? getWarrantyStatus(p.warrantyExpiryDate) : null;
    if (!status) return;
    warrantyStatusMap[status] = (warrantyStatusMap[status] || 0) + 1;
  });
  const warrantyStatusData = Object.entries(warrantyStatusMap).map(([name, value]) => ({
    name,
    value,
  }));

  // ---------- TOP STORES ----------
  const storeMap = {};
  purchases.forEach((p) => {
    const store = p.store || "Unknown";
    if (!storeMap[store]) storeMap[store] = { count: 0, total: 0 };
    storeMap[store].count += 1;
    storeMap[store].total += p.price || 0;
  });
  const topStores = Object.entries(storeMap)
    .map(([store, data]) => ({ store, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const maxStoreTotal = Math.max(...topStores.map((s) => s.total), 1);

  return (
    <div className="analytics-page">
      <div className="page-heading">
        <div>
          <div className="analytics-label">
            <TrendingUp size={14} />
            SPENDING INSIGHTS
          </div>
          <h1>Analytics</h1>
          <p>A visual breakdown of your purchases, warranties and spending habits.</p>
        </div>
      </div>

      {/* TOP STATS */}
      <div className="analytics-stats-grid">
        <div className="analytics-stat-card">
          <div className="analytics-stat-icon blue-icon">
            <IndianRupee size={20} />
          </div>
          <div>
            <span>Total Spent</span>
            <h2>₹{totalSpent.toLocaleString("en-IN")}</h2>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon purple-icon">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span>Total Purchases</span>
            <h2>{totalPurchases}</h2>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon green-icon">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span>Active Warranties</span>
            <h2>{activeWarranties}</h2>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon amber-icon">
            <TrendingUp size={20} />
          </div>
          <div>
            <span>Avg. Purchase Value</span>
            <h2>₹{avgSpend.toLocaleString("en-IN")}</h2>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 1 */}
      <div className="analytics-charts-grid">
        {/* MONTHLY SPEND */}
        <div className="analytics-card wide-card">
          <div className="analytics-card-header">
            <h3>Monthly Spending</h3>
            <span className="analytics-card-sub">Last {monthlyData.length} months</span>
          </div>

          {monthlyData.length > 1 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip
                  formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Spent"]}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="amount" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <LineChart width={500} height={260} data={monthlyData}>
              <Line dataKey="amount" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          )}
        </div>

        {/* CATEGORY BREAKDOWN */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <h3>Spend by Category</h3>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[entry.name] || "#cbd5e1"}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="analytics-legend">
            {categoryData.map((entry) => (
              <div className="analytics-legend-item" key={entry.name}>
                <span
                  className="legend-dot"
                  style={{ background: CATEGORY_COLORS[entry.name] || "#cbd5e1" }}
                ></span>
                <span className="legend-label">{entry.name}</span>
                <span className="legend-value">
                  ₹{entry.value.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2 */}
      <div className="analytics-charts-grid">
        {/* WARRANTY STATUS */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <h3>Warranty Status</h3>
          </div>

          {warrantyStatusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={warrantyStatusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {warrantyStatusData.map((entry, index) => (
                      <Cell
                        key={`wcell-${index}`}
                        fill={STATUS_COLORS[entry.name] || "#cbd5e1"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="analytics-legend">
                {warrantyStatusData.map((entry) => (
                  <div className="analytics-legend-item" key={entry.name}>
                    <span
                      className="legend-dot"
                      style={{ background: STATUS_COLORS[entry.name] || "#cbd5e1" }}
                    ></span>
                    <span className="legend-label">{entry.name}</span>
                    <span className="legend-value">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="analytics-empty-text">No warranty data available.</p>
          )}
        </div>

        {/* TOP STORES */}
        <div className="analytics-card wide-card">
          <div className="analytics-card-header">
            <h3>Top Stores</h3>
            <span className="analytics-card-sub">By total spend</span>
          </div>

          <div className="top-stores-list">
            {topStores.map((s) => (
              <div className="top-store-row" key={s.store}>
                <div className="top-store-icon">
                  <Store size={16} />
                </div>

                <div className="top-store-info">
                  <div className="top-store-top">
                    <span className="top-store-name">{s.store}</span>
                    <span className="top-store-amount">
                      ₹{s.total.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="top-store-bar-track">
                    <div
                      className="top-store-bar-fill"
                      style={{ width: `${(s.total / maxStoreTotal) * 100}%` }}
                    ></div>
                  </div>

                  <span className="top-store-count">
                    {s.count} {s.count === 1 ? "purchase" : "purchases"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;