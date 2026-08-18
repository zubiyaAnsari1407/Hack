import {
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  CalendarDays,
  Store,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllPurchases } from "../services/api";
import { formatDate, daysRemaining, getReturnStatus } from "../utils/dateHelper";

function Returns() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await getAllPurchases();
      if (res.success) {
        setPurchases(res.data);
      } else {
        setError(res.message || "Failed to load returns.");
      }
    } catch (err) {
      console.error(err);
      setError("Could not connect to backend. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  const returns = purchases
    .filter((p) => p.returnDeadline)
    .map((p) => ({
      id: p._id,
      product: p.productName,
      category: p.category,
      store: p.store,
      purchaseDate: p.purchaseDate,
      returnDeadline: p.returnDeadline,
      daysRemaining: daysRemaining(p.returnDeadline),
      price: p.price,
      status: getReturnStatus(p.returnDeadline),
    }));

  const filteredReturns = returns.filter((item) => {
    const matchesSearch =
      item.product?.toLowerCase().includes(search.toLowerCase()) ||
      item.store?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const urgentCount = returns.filter((i) => i.status === "Urgent").length;
  const upcomingCount = returns.filter((i) => i.status === "Upcoming").length;
  const safeCount = returns.filter((i) => i.status === "Safe").length;
  const expiredCount = returns.filter((i) => i.status === "Expired").length;

  const getStatusIcon = (status) => {
    if (status === "Urgent") return <AlertTriangle size={15} />;
    if (status === "Upcoming") return <Clock size={15} />;
    if (status === "Safe") return <CheckCircle2 size={15} />;
    return <RotateCcw size={15} />;
  };

  if (loading) {
    return <div className="page-loading">Loading returns...</div>;
  }

  if (error) {
    return (
      <div className="page-error">
        <p>{error}</p>
        <button onClick={fetchPurchases}>Retry</button>
      </div>
    );
  }

  return (
    <div className="returns-page">
      <div className="page-heading">
        <div>
          <div className="return-label">
            <RotateCcw size={14} />
            RETURN MANAGER
          </div>
          <h1>Returns</h1>
          <p>Keep track of your return deadlines and never miss a return window.</p>
        </div>
      </div>

      <div className="return-summary">
        <div className="return-summary-card">
          <div className="return-summary-icon urgent-summary">
            <AlertTriangle size={20} />
          </div>
          <div>
            <span>Urgent</span>
            <h2>{urgentCount}</h2>
          </div>
        </div>

        <div className="return-summary-card">
          <div className="return-summary-icon upcoming-summary">
            <Clock size={20} />
          </div>
          <div>
            <span>Upcoming</span>
            <h2>{upcomingCount}</h2>
          </div>
        </div>

        <div className="return-summary-card">
          <div className="return-summary-icon safe-summary">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span>Safe</span>
            <h2>{safeCount}</h2>
          </div>
        </div>

        <div className="return-summary-card">
          <div className="return-summary-icon expired-summary-return">
            <RotateCcw size={20} />
          </div>
          <div>
            <span>Expired</span>
            <h2>{expiredCount}</h2>
          </div>
        </div>
      </div>

      <div className="return-toolbar">
        <div className="return-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search returns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="All">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Home">Home</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="return-list">
        {filteredReturns.length === 0 ? (
          <div className="empty-return">
            <RotateCcw size={40} />
            <h3>No returns found</h3>
            <p>Try changing your search or category.</p>
          </div>
        ) : (
          filteredReturns.map((item) => (
            <div className="return-card" key={item.id}>
              <div className="return-card-top">
                <div className="return-product">
                  <div className="return-product-icon">
                    <ShoppingBag size={21} />
                  </div>
                  <div>
                    <h3>{item.product}</h3>
                    <p>{item.store}</p>
                  </div>
                </div>

                <div className={`return-status ${item.status.toLowerCase()}`}>
                  {getStatusIcon(item.status)}
                  {item.status}
                </div>
              </div>

              <div className="return-details">
                <div>
                  <span>
                    <CalendarDays size={13} />
                    Purchased
                  </span>
                  <strong>{formatDate(item.purchaseDate)}</strong>
                </div>

                <div>
                  <span>
                    <RotateCcw size={13} />
                    Return By
                  </span>
                  <strong>{formatDate(item.returnDeadline)}</strong>
                </div>

                <div>
                  <span>
                    <Store size={13} />
                    Store
                  </span>
                  <strong>{item.store}</strong>
                </div>

                <div>
                  <span>Purchase Amount</span>
                  <strong>₹{item.price?.toLocaleString("en-IN")}</strong>
                </div>
              </div>

              <div className="return-countdown">
                <div>
                  <span>Return window</span>
                  <strong>
                    {item.daysRemaining > 0
                      ? `${item.daysRemaining} ${
                          item.daysRemaining === 1 ? "day" : "days"
                        } remaining`
                      : "Return period expired"}
                  </strong>
                </div>

                <div className="return-countdown-bar">
                  <div
                    className={`return-countdown-fill ${
                      item.status === "Urgent"
                        ? "urgent-bar"
                        : item.status === "Upcoming"
                        ? "upcoming-bar"
                        : item.status === "Expired"
                        ? "expired-return-bar"
                        : "safe-bar"
                    }`}
                    style={{
                      width:
                        item.status === "Expired"
                          ? "100%"
                          : `${Math.min(item.daysRemaining * 8, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="return-card-footer">
                <span className="return-category">{item.category}</span>
                <button onClick={() => navigate(`/purchases/${item.id}`)}>
                  View Purchase
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Returns;