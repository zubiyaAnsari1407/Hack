import {
  Search,
  Filter,
  ShoppingBag,
  ShieldCheck,
  RotateCcw,
  CalendarDays,
  ChevronDown,
} from "lucide-react";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllPurchases } from "../services/api";
import AddPurchaseModal from "../components/AddPurchaseModal";

function Purchases() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await getAllPurchases();
      const mapped = res.data.map((p) => ({
        id: p._id,
        name: p.productName,
        category: p.category || "Other",
        store: p.store || "-",
        price: p.price,
        date: p.purchaseDate
          ? new Date(p.purchaseDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-",
        warranty:
          p.warrantyPeriod && p.warrantyPeriod > 0
            ? `${p.warrantyPeriod} Months`
            : "None",
        returnDays: p.returnDeadline
          ? Math.max(
              0,
              Math.ceil(
                (new Date(p.returnDeadline) - new Date()) /
                  (1000 * 60 * 60 * 24)
              )
            )
          : null,
      }));
      setPurchases(mapped);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Could not load purchases. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      purchase.name.toLowerCase().includes(search.toLowerCase()) ||
      purchase.store.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || purchase.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="purchases-page">
      {/* HEADER */}
      <div className="page-heading">
        <div>
          <h1>Purchases</h1>
          <p>Manage and track all your purchases in one place.</p>
        </div>

        <button className="add-purchase-btn" onClick={() => setShowModal(true)}>
          + Add Purchase
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="purchase-toolbar">
        <div className="purchase-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search purchases or stores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-wrapper">
          <Filter size={17} />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Home">Home</option>
            <option value="Other">Other</option>
          </select>
          <ChevronDown size={15} />
        </div>
      </div>

      {/* LOADING / ERROR STATES */}
      {loading && <p style={{ color: "#64748b" }}>Loading purchases...</p>}
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}

      {/* RESULT COUNT */}
      {!loading && !error && (
        <div className="purchase-count">
          <span>{filteredPurchases.length} purchases</span>
        </div>
      )}

      {/* PURCHASE GRID */}
      {!loading && !error && (
        <div className="purchase-grid">
          {filteredPurchases.map((purchase) => (
            <div className="purchase-card" key={purchase.id}>
              <div className="purchase-card-top">
                <div className="product-icon">
                  <ShoppingBag size={21} />
                </div>
                <span className="category-badge">{purchase.category}</span>
              </div>

              <h3>{purchase.name}</h3>
              <p className="store-name">{purchase.store}</p>

              <div className="product-price">
                ₹{purchase.price?.toLocaleString("en-IN")}
              </div>

              <div className="purchase-details">
                <div className="detail-item">
                  <CalendarDays size={15} />
                  <span>{purchase.date}</span>
                </div>

                <div className="detail-item">
                  <ShieldCheck size={15} />
                  <span>{purchase.warranty}</span>
                </div>

                {purchase.returnDays !== null && (
                  <div className="detail-item">
                    <RotateCcw size={15} />
                    <span>Return: {purchase.returnDays} days</span>
                  </div>
                )}
              </div>

              <button
                className="view-purchase-btn"
                onClick={() => navigate(`/purchases/${purchase.id}`)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && filteredPurchases.length === 0 && (
        <div className="empty-state">
          <ShoppingBag size={40} />
          <h3>No purchases found</h3>
          <p>Try changing your search or filter, or add a new purchase.</p>
        </div>
      )}

      {/* ADD PURCHASE MODAL */}
      {showModal && (
        <AddPurchaseModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchPurchases}
        />
      )}
    </div>
  );
}

export default Purchases;