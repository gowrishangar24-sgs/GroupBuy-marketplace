import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    axios
      .get("/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOrders(res.data.orders || []))
      .catch((err) => console.error("Error fetching orders:", err))
      .finally(() => setLoading(false));
  }, []);

  const confirmOrder = async (orderId) => {
    setConfirmingId(orderId);
    try {
      const res = await axios.put(
        `/orders/${orderId}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message || "Order confirmed and officially placed!");
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? res.data.order || { ...o, status: "placed", orderStatus: "placed", paymentStatus: "paid" }
            : o
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to confirm order");
    } finally {
      setConfirmingId(null);
    }
  };

  if (!user) return null;

  const readyToConfirmOrders = orders.filter(
    (o) => (o.status || o.orderStatus) === "ready_to_confirm"
  );

  return (
    <>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="container mt-5 mb-5" style={{ minHeight: "70vh" }}>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 className="fw-bold mb-1">📦 My Orders</h2>
            <p className="text-muted mb-0">
              Track your pledged group deals and placed orders
            </p>
          </div>
          <a href="/" className="btn btn-outline-success">
            + Browse More Deals
          </a>
        </div>

        {/* Urgent Callout Banners for Milestone Reached Orders */}
        {readyToConfirmOrders.map((o) => (
          <div
            key={o._id}
            className="alert alert-warning border-2 border-warning shadow-sm mb-4 p-3 rounded-3"
          >
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div>
                <h5 className="alert-heading fw-bold mb-1">
                  🎉 Milestone Reached! Group discount unlocked at ₹
                  {(o.selectedTierPrice || o.totalPrice)?.toLocaleString("en-IN")}.
                </h5>
                <p className="mb-0 text-dark small">
                  Pledged order for <strong>{o.deal?.title || o.product?.title || "Group Buy Deal"}</strong> is ready to be confirmed!
                </p>
              </div>
              <button
                className="btn btn-success fw-bold px-4 py-2 shadow-sm"
                onClick={() => confirmOrder(o._id)}
                disabled={confirmingId === o._id}
              >
                {confirmingId === o._id ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Confirming...
                  </>
                ) : (
                  "Confirm to Place Order"
                )}
              </button>
            </div>
          </div>
        ))}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" style={{ width: "3rem", height: "3rem" }} />
            <p className="mt-3 text-muted">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-5 card shadow-sm p-4 rounded-4">
            <h4 className="fw-bold text-muted mb-2">No orders found</h4>
            <p className="text-muted mb-4">You haven't placed or pledged any orders yet.</p>
            <div>
              <a href="/" className="btn btn-success btn-lg px-4 fw-bold">
                Explore Deals
              </a>
            </div>
          </div>
        ) : (
          <div className="card shadow border-0 rounded-4 p-3">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Item</th>
                    <th>Selected Tier</th>
                    <th>Qty</th>
                    <th>Total Price</th>
                    <th>Payment</th>
                    <th>Order Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const currentStatus = order.status || order.orderStatus || "placed";
                    const isPledged = currentStatus === "pledged";
                    const isReadyToConfirm = currentStatus === "ready_to_confirm";
                    const isPlacedOrConfirmed =
                      currentStatus === "placed" ||
                      currentStatus === "confirmed" ||
                      currentStatus === "completed" ||
                      currentStatus === "shipped" ||
                      currentStatus === "delivered";

                    const itemTitle = order.deal?.title || order.product?.title || "Group Buy Order";
                    const itemImage = order.deal?.image || order.product?.image || "/shopping.png";

                    return (
                      <tr key={order._id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={itemImage}
                              alt={itemTitle}
                              style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }}
                            />
                            <div>
                              <div className="fw-semibold text-dark">{itemTitle}</div>
                              <small className="text-muted">ID: {order._id.slice(-8)}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          {order.selectedTierPrice > 0 ? (
                            <div>
                              <span className="fw-bold text-success">
                                ₹{order.selectedTierPrice?.toLocaleString("en-IN")}
                              </span>
                              {order.targetMinBuyers > 0 && (
                                <small className="text-muted d-block" style={{ fontSize: "12px" }}>
                                  Target: {order.targetMinBuyers} buyers
                                </small>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="fw-semibold">{order.quantity}</td>
                        <td className="fw-bold text-dark">
                          ₹{order.totalPrice?.toLocaleString("en-IN")}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              order.paymentStatus === "paid"
                                ? "bg-success"
                                : order.paymentStatus === "failed"
                                ? "bg-danger"
                                : "bg-warning text-dark"
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td>
                          {isPledged && (
                            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">
                              ⏳ Waiting for Milestone ({order.targetMinBuyers ? `${order.targetMinBuyers} buyers needed` : "Pledged"})
                            </span>
                          )}
                          {isReadyToConfirm && (
                            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">
                              🎉 Milestone Reached!
                            </span>
                          )}
                          {isPlacedOrConfirmed && (
                            <span className="badge bg-success px-3 py-2 rounded-pill">
                              ✓ Order Placed / Confirmed
                            </span>
                          )}
                          {currentStatus === "cancelled" && (
                            <span className="badge bg-danger px-3 py-2 rounded-pill">
                              ✕ Cancelled
                            </span>
                          )}
                        </td>
                        <td>
                          {isReadyToConfirm ? (
                            <button
                              className="btn btn-sm btn-success fw-bold px-3 py-1"
                              onClick={() => confirmOrder(order._id)}
                              disabled={confirmingId === order._id}
                            >
                              {confirmingId === order._id ? "Confirming..." : "Confirm"}
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => navigate(order.deal ? `/product/${order.deal._id}` : order.product ? `/product/${order.product._id}` : "/")}
                            >
                              View Item
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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

export default MyOrders;
