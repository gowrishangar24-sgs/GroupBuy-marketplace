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
  const [searchTerm, setSearchTerm] = useState(""); // ✅ Added global navigation state tracker

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    axios
      .get("http://localhost:5000/api/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOrders(res.data.orders))
      .catch((err) => console.log(err))
      .finally(() => setLoadingOrders(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  if (!user) return null;

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
                  <table className="table table-bordered">
                    <thead className="table-dark">
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td>{order.product?.title || "N/A"}</td>
                          <td>{order.quantity}</td>
                          <td>₹{order.totalPrice}</td>
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
                            <span
                              className={`badge ${
                                order.orderStatus === "delivered"
                                  ? "bg-success"
                                  : order.orderStatus === "cancelled"
                                  ? "bg-danger"
                                  : "bg-info text-dark"
                              }`}
                            >
                              {order.orderStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
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