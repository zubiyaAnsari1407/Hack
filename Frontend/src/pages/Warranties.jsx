  import {
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    Search,
    CalendarDays,
    Clock,
    ChevronRight,
  } from "lucide-react";


  import { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import { getAllPurchases } from "../services/api";
  import {
    formatDate,
    daysRemaining,
    getWarrantyStatus,
    getWarrantyProgress,
  } from "../utils/dateHelper";

  function Warranties() {
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
          setError(res.message || "Failed to load warranties.");
        }
      } catch (err) {
        console.error(err);
        setError("Could not connect to backend. Is the server running?");
      } finally {
        setLoading(false);
      }
    };

    // Only items that actually have a warranty
    const warranties = purchases
      .filter((p) => p.warrantyExpiryDate)
      .map((p) => ({
        id: p._id,
        product: p.productName,
        category: p.category,
        store: p.store,
        purchaseDate: p.purchaseDate,
        expiryDate: p.warrantyExpiryDate,
        warranty: p.warrantyPeriod ? `${p.warrantyPeriod} Months` : "N/A",
        daysRemaining: daysRemaining(p.warrantyExpiryDate),
        status: getWarrantyStatus(p.warrantyExpiryDate),
        progress: getWarrantyProgress(p.purchaseDate, p.warrantyExpiryDate),
      }));

    const filteredWarranties = warranties.filter((item) => {
      const matchesSearch =
        item.product?.toLowerCase().includes(search.toLowerCase()) ||
        item.store?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || item.category === category;
      return matchesSearch && matchesCategory;
    });

    const activeCount = warranties.filter((i) => i.status === "Active").length;
    const expiringCount = warranties.filter((i) => i.status === "Expiring Soon").length;
    const expiredCount = warranties.filter((i) => i.status === "Expired").length;

    const getStatusIcon = (status) => {
      if (status === "Active") return <CheckCircle2 size={15} />;
      if (status === "Expiring Soon") return <AlertTriangle size={15} />;
      return <Clock size={15} />;
    };

    if (loading) {
      return <div className="page-loading">Loading warranties...</div>;
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
      <div className="warranties-page">
        <div className="page-heading">
          <div>
            <div className="warranty-label">
              <ShieldCheck size={14} />
              WARRANTY MANAGER
            </div>
            <h1>Warranties</h1>
            <p>Track your product warranties and never miss an expiry date.</p>
          </div>
        </div>

        <div className="warranty-summary">
          <div className="warranty-summary-card">
            <div className="summary-icon active-summary">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span>Active Warranties</span>
              <h2>{activeCount}</h2>
            </div>
          </div>

          <div className="warranty-summary-card">
            <div className="summary-icon expiring-summary">
              <AlertTriangle size={20} />
            </div>
            <div>
              <span>Expiring Soon</span>
              <h2>{expiringCount}</h2>
            </div>
          </div>

          <div className="warranty-summary-card">
            <div className="summary-icon expired-summary">
              <Clock size={20} />
            </div>
            <div>
              <span>Expired</span>
              <h2>{expiredCount}</h2>
            </div>
          </div>
        </div>

        <div className="warranty-toolbar">
          <div className="warranty-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search warranties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Home">Home</option>
            <option value="Clothing">Clothing</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="warranty-list">
          {filteredWarranties.length === 0 ? (
            <div className="empty-warranty">
              <ShieldCheck size={40} />
              <h3>No warranties found</h3>
              <p>Try changing your search or category.</p>
            </div>
          ) : (
            filteredWarranties.map((item) => (
              <div className="warranty-card" key={item.id}>
                <div className="warranty-card-top">
                  <div className="warranty-product">
                    <div className="product-shield">
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <h3>{item.product}</h3>
                      <p>{item.store}</p>
                    </div>
                  </div>

                  <div
                    className={`warranty-status ${item.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {getStatusIcon(item.status)}
                    {item.status}
                  </div>
                </div>

                <div className="warranty-details">
                  <div>
                    <span>
                      <CalendarDays size={13} />
                      Purchased
                    </span>
                    <strong>{formatDate(item.purchaseDate)}</strong>
                  </div>

                  <div>
                    <span>
                      <ShieldCheck size={13} />
                      Warranty
                    </span>
                    <strong>{item.warranty}</strong>
                  </div>

                  <div>
                    <span>
                      <CalendarDays size={13} />
                      Expires
                    </span>
                    <strong>{formatDate(item.expiryDate)}</strong>
                  </div>
                </div>

                <div className="warranty-progress-area">
                  <div className="warranty-progress-header">
                    <span>Warranty period</span>
                    <strong>
                      {item.daysRemaining > 0
                        ? `${item.daysRemaining} days remaining`
                        : "Expired"}
                    </strong>
                  </div>

                  <div className="warranty-bar">
                    <div
                      className={`warranty-bar-fill ${
                        item.status === "Expiring Soon"
                          ? "expiring-bar"
                          : item.status === "Expired"
                          ? "expired-bar"
                          : ""
                      }`}
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="warranty-card-footer">
                  <span className="warranty-category">{item.category}</span>
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

  export default Warranties;