import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Account() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ Added global navigation state tracker

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
      .catch((err) => console.log(err))
      .finally(() => setLoadingOrders(false));
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  if (!user) return null;

  const readyToConfirmOrders = orders.filter(
    (o) => o.status === "ready_to_confirm" || o.orderStatus === "ready_to_confirm"
  );

  return (
    <>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="container mt-5 mb-5">
        <div className="row">
          {/* Profile Card */}
          <div className="col-md-4 mb-4">
            <div className="card shadow p-4 text-center">
              <div
                className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: "80px", height: "80px", fontSize: "32px" }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </div>

              <h4 className="fw-bold">{user.name}</h4>
              <p className="text-muted">{user.email}</p>

              <span
                className={`badge ${
                  user.role === "seller"
                    ? "bg-warning text-dark"
                    : user.role === "admin"
                    ? "bg-danger"
                    : "bg-success"
                } mb-3`}
              >
                {user.role?.toUpperCase()}
              </span>

              {user.role === "seller" && (
                <a href="/SellerDashboard" className="btn btn-dark w-100 mb-2">
                  Seller Dashboard
                </a>
              )}

              <button className="btn btn-outline-danger w-100" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>

          {/* Orders */}
          <div className="col-md-8">
            <div className="card shadow p-4">
              <h4 className="fw-bold mb-4">My Orders</h4>

              {/* URGENT HIGHLIGHTED CALLOUT BANNERS FOR READY_TO_CONFIRM ORDERS */}
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
                        Pledged order for <strong>{o.deal?.title || o.product?.title || "Group Deal"}</strong> is ready to be confirmed!
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

              {loadingOrders ? (
                <p>Loading orders...</p>
              ) : orders.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No orders yet.</p>
                  <a href="/" className="btn btn-success">
                    Browse Deals
                  </a>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>Product / Deal</th>
                        <th>Qty</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const currentStatus = order.status || order.orderStatus || "placed";
                        const isPledged = currentStatus === "pledged";
                        const isReadyToConfirm = currentStatus === "ready_to_confirm";
                        const isConfirmedOrPlaced =
                          currentStatus === "placed" ||
                          currentStatus === "confirmed" ||
                          currentStatus === "completed" ||
                          currentStatus === "shipped" ||
                          currentStatus === "delivered";

                        return (
                          <tr key={order._id}>
                            <td>
                              <div className="fw-semibold">
                                {order.deal?.title || order.product?.title || "Group Buy Order"}
                              </div>
                              {order.selectedTierPrice > 0 && (
                                <small className="text-muted d-block">
                                  Milestone Tier: ₹{order.selectedTierPrice?.toLocaleString("en-IN")} ({order.targetMinBuyers} buyers needed)
                                </small>
                              )}
                            </td>
                            <td>{order.quantity}</td>
                            <td>₹{order.totalPrice?.toLocaleString("en-IN")}</td>
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
                                <span className="badge bg-warning text-dark px-3 py-2">
                                  Waiting for Milestone ({order.targetMinBuyers ? `${order.targetMinBuyers} buyers needed` : "Pending"})
                                </span>
                              )}
                              {isReadyToConfirm && (
                                <div className="d-flex flex-column gap-1">
                                  <span className="badge bg-warning text-dark px-2 py-1">
                                    🎉 Milestone Reached!
                                  </span>
                                  <button
                                    className="btn btn-sm btn-success fw-bold"
                                    onClick={() => confirmOrder(order._id)}
                                    disabled={confirmingId === order._id}
                                  >
                                    {confirmingId === order._id ? "Confirming..." : "Confirm to Place Order"}
                                  </button>
                                </div>
                              )}
                              {isConfirmedOrPlaced && (
                                <span className="badge bg-success px-3 py-2">
                                  Order Placed / Confirmed
                                </span>
                              )}
                              {currentStatus === "cancelled" && (
                                <span className="badge bg-danger px-3 py-2">
                                  Cancelled
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Account;