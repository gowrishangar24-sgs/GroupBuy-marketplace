import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

function Orders() {
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
      alert(res.data.message || "Order confirmed!");
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? res.data.order || { ...o, status: "placed", orderStatus: "placed" }
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

  return (
    <>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="container py-5" style={{ minHeight: "75vh" }}>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-semibold mb-2">
              📦 Order Management
            </span>
            <h2 className="fw-bold mb-1 text-dark">My Orders & Pledges</h2>
            <p className="text-muted mb-0">
              Track your placed orders, locked milestone deal prices, and pledged items
            </p>
          </div>
          <button onClick={() => navigate("/")} className="btn btn-outline-success fw-bold rounded-3">
            + Explore More Deals
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5 d-flex flex-column align-items-center justify-content-center">
            <div className="spinner-border text-success" style={{ width: "3rem", height: "3rem" }} />
            <p className="mt-3 text-muted fw-medium">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="card shadow-sm border-0 p-5 rounded-4 text-center bg-light">
            <div className="fs-1 mb-2">📦</div>
            <h4 className="fw-bold text-dark mb-2">No Orders Found</h4>
            <p className="text-muted mb-4">You haven't placed any group deal pledges or orders yet.</p>
            <div>
              <button onClick={() => navigate("/")} className="btn btn-success btn-lg px-4 fw-bold rounded-3">
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {orders.map((order) => {
              const currentStatus = order.status || order.orderStatus || "placed";
              const isPledged = currentStatus === "pledged";
              const isReadyToConfirm = currentStatus === "ready_to_confirm";
              const isPlacedOrConfirmed =
                currentStatus === "placed" ||
                currentStatus === "confirmed" ||
                currentStatus === "completed";

              const itemImage =
                order.deal?.image || order.product?.image || "/shopping.png";
              const itemTitle =
                order.deal?.title || order.product?.title || "Group Buy Item";
              const lockedPrice =
                order.selectedTierPrice || order.totalPrice || order.product?.price || 0;
              const targetGoal =
                order.targetMinBuyers || order.deal?.targetMembers || 1;

              return (
                <div key={order._id} className="col-12 col-lg-6">
                  <div className="card shadow-sm border-0 rounded-4 overflow-hidden h-100 bg-white">
                    <div className="card-header bg-light border-0 p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <span className="small text-muted fw-semibold">
                        Order ID: <span className="font-monospace text-dark">#{order._id?.slice(-8)}</span>
                      </span>
                      <span className="small text-muted">
                        📅 {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="card-body p-4">
                      <div className="d-flex align-items-start gap-3">
                        <img
                          src={itemImage}
                          alt={itemTitle}
                          className="rounded-3 border flex-shrink-0"
                          style={{ width: "90px", height: "90px", objectFit: "cover" }}
                        />

                        <div className="flex-grow-1">
                          <h5 className="fw-bold text-dark mb-2">{itemTitle}</h5>
                          
                          <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                            <span className="fs-5 fw-bold text-success">
                              ₹{lockedPrice?.toLocaleString("en-IN")}
                            </span>
                            <span className="badge bg-secondary-subtle text-secondary rounded-pill">
                              Goal: {targetGoal} Buyers
                            </span>
                          </div>

                          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-3 pt-2 border-top">
                            <div>
                              <small className="text-muted d-block">Status</small>
                              {isPlacedOrConfirmed ? (
                                <span className="badge bg-success px-3 py-2 rounded-pill">
                                  ✓ Order Placed
                                </span>
                              ) : isReadyToConfirm ? (
                                <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">
                                  🎉 Goal Reached (Ready)
                                </span>
                              ) : isPledged ? (
                                <span className="badge bg-info text-dark px-3 py-2 rounded-pill">
                                  ⏳ Pledged (In Pool)
                                </span>
                              ) : (
                                <span className="badge bg-secondary px-3 py-2 rounded-pill">
                                  {currentStatus}
                                </span>
                              )}
                            </div>

                            {isReadyToConfirm && (
                              <button
                                className="btn btn-success btn-sm fw-bold px-3 py-2 shadow-sm rounded-3"
                                onClick={() => confirmOrder(order._id)}
                                disabled={confirmingId === order._id}
                              >
                                {confirmingId === order._id ? "Confirming..." : "Confirm Order"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

export default Orders;
