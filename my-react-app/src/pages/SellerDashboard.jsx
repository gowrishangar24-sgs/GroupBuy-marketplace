import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

// Resolve currently-active tier price from a deal's tiers array
function resolveActiveTierPrice(tiers, joinedUsers) {
  if (!Array.isArray(tiers) || tiers.length === 0) return null;
  const sorted = [...tiers].sort((a, b) => b.minUsers - a.minUsers);
  const active = sorted.find((t) => joinedUsers >= t.minUsers);
  return active ? active.price : sorted[sorted.length - 1].price;
}

function SellerDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "seller") {
      navigate("/login");
      return;
    }

    Promise.all([
      axios.get("/seller/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get("/products/seller/my-products", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get("/deals/my-deals", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([dashRes, prodRes, dealRes]) => {
        setDashboard(dashRes.data.dashboard);
        setProducts(prodRes.data.products);
        setDeals(dealRes.data.deals);
      })
      .catch((err) => console.error("Dashboard mount error:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((p) => p._id !== productId));
      alert("Product deleted successfully");
    } catch {
      alert("Failed to remove product");
    }
  };

  const handleDeleteDeal = async (dealId) => {
    if (!window.confirm("Delete this group deal?")) return;
    try {
      await axios.delete(`/deals/${dealId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeals(deals.filter((d) => d._id !== dealId));
      alert("Deal deleted successfully");
    } catch {
      alert("Failed to delete deal");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mt-5 text-center py-5">
          <div className="spinner-border text-success" />
          <p className="mt-2 text-muted">Loading seller workspace...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="container mt-5 mb-5">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h2 className="fw-bold m-0">Seller Hub Console</h2>
            <p className="text-muted mb-0">Session: {user?.name}</p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/AddProduct" className="btn btn-success shadow-sm">+ New Product</Link>
            <Link to="/CreateDeal" className="btn btn-dark shadow-sm">+ Launch Deal</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="row mb-5">
          {[
            { label: "Total Products",    value: dashboard?.totalProducts ?? 0,         icon: "📦", color: "primary"  },
            { label: "Total Deals",       value: dashboard?.totalDeals ?? 0,            icon: "🤝", color: "success"  },
            { label: "Active Groups",     value: dashboard?.activeDeals ?? 0,           icon: "🔥", color: "warning"  },
            { label: "Completed Deals",   value: dashboard?.completedDeals ?? 0,        icon: "✅", color: "info"     },
            { label: "Total Orders",      value: dashboard?.totalOrders ?? 0,           icon: "🛒", color: "dark"     },
            { label: "Total Revenue",     value: `₹${dashboard?.totalRevenue ?? 0}`,   icon: "💰", color: "danger"   },
          ].map((stat, i) => (
            <div key={i} className="col-xl-4 col-md-6 mb-3">
              <div className="card shadow-sm h-100 border-0 bg-light">
                <div className="card-body d-flex align-items-center gap-3">
                  <div className="fs-1 p-2 bg-white rounded shadow-sm">{stat.icon}</div>
                  <div>
                    <small className="text-uppercase fw-semibold text-muted d-block">{stat.label}</small>
                    <h3 className="fw-bold m-0 mt-1">{stat.value}</h3>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── DEALS TABLE ─────────────────────────────────────────── */}
        <div className="card shadow-sm p-4 border-0 mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold mb-0">🤝 Active Group Purchase Campaigns</h4>
            <Link to="/CreateDeal" className="btn btn-sm btn-outline-dark">Launch Campaign</Link>
          </div>

          {deals.length === 0 ? (
            <div className="text-center py-4 bg-light rounded">
              <p className="text-muted mb-2">No group buying pools yet.</p>
              <Link to="/CreateDeal" className="btn btn-sm btn-success">Create First Pool</Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover border align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Title</th>
                    <th>Current Price</th>
                    <th>Pricing Tiers</th>
                    <th>Capacity</th>
                    <th>Joined</th>
                    <th>Days Left</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal) => {
                    const activePrice =
                      deal.activeTierPrice ??
                      resolveActiveTierPrice(deal.tiers, deal.joinedUsers);

                    return (
                      <tr key={deal._id}>
                        <td className="fw-bold text-dark">{deal.title}</td>

                        {/* Current active tier price */}
                        <td className="text-success fw-semibold">
                          {activePrice !== null ? `₹${activePrice}` : "—"}
                        </td>

                        {/* Tiers pill badges */}
                        <td>
                          {Array.isArray(deal.tiers) && deal.tiers.length > 0 ? (
                            <div className="d-flex flex-wrap gap-1">
                              {[...deal.tiers]
                                .sort((a, b) => a.minUsers - b.minUsers)
                                .map((t, i) => (
                                  <span
                                    key={i}
                                    className={`badge ${
                                      activePrice === t.price
                                        ? "bg-success"
                                        : "bg-light text-dark border"
                                    }`}
                                    style={{ fontSize: "11px" }}
                                  >
                                    {t.minUsers}+→₹{t.price}
                                  </span>
                                ))}
                            </div>
                          ) : (
                            <span className="text-muted small">—</span>
                          )}
                        </td>

                        <td>{deal.targetMembers} slots</td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {deal.joinedUsers} / {deal.targetMembers}
                          </span>
                        </td>
                        <td>{deal.daysLeft ?? 0} days</td>
                        <td>
                          <span
                            className={`badge ${
                              deal.status === "completed"
                                ? "bg-success"
                                : deal.status === "cancelled"
                                ? "bg-danger"
                                : "bg-warning text-dark"
                            }`}
                          >
                            {deal.status?.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-danger px-2 py-1"
                            onClick={() => handleDeleteDeal(deal._id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── PRODUCTS TABLE ──────────────────────────────────────── */}
        <div className="card shadow-sm p-4 border-0 mb-5">
          <h4 className="fw-bold mb-3">📦 Product Catalog</h4>
          {products.length === 0 ? (
            <div className="text-center py-4 bg-light rounded">
              <p className="text-muted">No products listed yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover border align-middle">
                <thead className="table-secondary">
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <img
                          src={product.image || "/shopping.png"}
                          alt={product.title}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "6px",
                          }}
                        />
                      </td>
                      <td className="fw-semibold">{product.title}</td>
                      <td>
                        <span className="badge bg-dark-subtle text-dark border">
                          {product.category}
                        </span>
                      </td>
                      <td className="fw-bold">₹{product.price}</td>
                      <td>{product.stock} units</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger px-2 py-1"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── RECENT ORDERS ───────────────────────────────────────── */}
        {dashboard?.recentOrders?.length > 0 && (
          <div className="card shadow-sm p-4 border-0">
            <h4 className="fw-bold mb-3">🛒 Recent Orders</h4>
            <div className="table-responsive">
              <table className="table table-bordered table-striped align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Item</th>
                    <th>Buyer</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>{order.product?.title || "—"}</td>
                      <td>{order.buyer?.name || "—"}</td>
                      <td>{order.quantity} pcs</td>
                      <td className="fw-semibold text-success">₹{order.totalPrice}</td>
                      <td>
                        <span className="badge bg-info text-dark">
                          {order.orderStatus?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      <Footer />
    </>
  );
}

export default SellerDashboard;
