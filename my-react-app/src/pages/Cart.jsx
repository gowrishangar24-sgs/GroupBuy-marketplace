import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); 
  
  // ── 1. NEW STATE FOR CART CHECKOUT FLOW ──
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [address, setAddress] = useState("");
  const [paymentMode, setPaymentMode] = useState("COD");
  const [checkingOut, setCheckingOut] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      alert("Please login to view your cart");
      navigate("/login");
      return;
    }
    fetchCart();
  }, []);

  const fetchCart = () => {
    axios
      .get("http://localhost:5000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.success) {
          setCart(res.data.cart);
        }
      })
      .catch((err) => console.error("Error fetching cart:", err))
      .finally(() => setLoading(false));
  };

  const handleUpdateQuantity = async (productId, currentQty, amountChange) => {
    const newQty = currentQty + amountChange;
    if (newQty < 1) return;

    try {
      const res = await axios.put(
        `http://localhost:5000/api/cart/update/${productId}`,
        { quantity: newQty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error updating quantity");
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/cart/remove/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      alert("Error removing item");
    }
  };

  // ── 2. NEW CART CHECKOUT ENGINE PIPELINE ──
  const handleCartCheckout = async () => {
    if (!address.trim()) {
      alert("Please enter your shipping address");
      return;
    }
    
    setCheckingOut(true);
    try {
      // Loop through every item in the cart array and send it to your order creation backend
      for (const item of cart.items) {
        if (!item.product) continue;
        await axios.post(
          "http://localhost:5000/api/orders/create",
          { 
            productId: item.product._id, 
            quantity: item.quantity, 
            shippingAddress: address 
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Remove the item from backend cart schema after ordering it successfully
        await axios.delete(`http://localhost:5000/api/cart/remove/${item.product._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      alert("Order Placed");
      setShowCheckoutModal(false);
      setAddress("");
      navigate("/account"); // Redirect straight to My Orders tab
    } catch (error) {
      alert(error.response?.data?.message || "Checkout failed processing");
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <div className="container py-5 text-center">
          <div className="spinner-border text-success" />
          <p className="mt-2">Loading your cart...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="container mt-5 mb-5" style={{ minHeight: "60vh" }}>
        <h2 className="fw-bold mb-4 text-dark">🛒 Shopping Cart</h2>

        {cart.items.length === 0 ? (
          <div className="card text-center p-5 shadow-sm border-0 bg-white">
            <div className="fs-1">🛍️</div>
            <h4 className="mt-3 text-muted">Your cart is empty</h4>
            <p className="text-secondary">Explore trending deals to save money with friends!</p>
            <Link to="/" className="btn btn-success mx-auto mt-2" style={{ maxWidth: "200px" }}>
              Explore Deals
            </Link>
          </div>
        ) : (
          <div className="row">
            <div className="col-lg-8 mb-4">
              <div className="card shadow-sm p-4 border-0 bg-white text-dark">
                <div className="table-responsive">
                  <table className="table align-middle text-dark">
                    <thead className="table-light">
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.items.map((item) => {
                        const product = item.product;
                        if (!product) return null;
                        return (
                          <tr key={item._id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={product.image || "/shopping.png"}
                                  alt={product.title}
                                  style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }}
                                  className="me-3"
                                />
                                <span className="fw-semibold text-truncate" style={{ maxWidth: "150px" }}>
                                  {product.title}
                                </span>
                              </div>
                            </td>
                            <td>₹{item.price}</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <button
                                  className="btn btn-sm btn-outline-secondary px-2 py-0 text-dark"
                                  onClick={() => handleUpdateQuantity(product._id, item.quantity, -1)}
                                >
                                  -
                                </button>
                                <span className="fw-bold">{item.quantity}</span>
                                <button
                                  className="btn btn-sm btn-outline-secondary px-2 py-0 text-dark"
                                  onClick={() => handleUpdateQuantity(product._id, item.quantity, 1)}
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="fw-bold text-success">₹{item.price * item.quantity}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRemoveItem(product._id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card shadow-sm p-4 border-0 bg-light text-dark">
                <h4 className="fw-bold mb-4">Order Summary</h4>
                <div className="d-flex justify-content-between mb-3">
                  <span>Total Items:</span>
                  <span className="fw-bold">
                    {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <hr />
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="fs-5">Total Amount:</span>
                  <span className="fs-3 fw-bold text-success">₹{cart.totalAmount}</span>
                </div>
                
                {/* ── 3. UPDATED CLICK HANDLER TO TRIGGER SYSTEM OPEN MODAL ── */}
                <button
                  className="btn btn-success btn-lg w-100 shadow fw-bold text-uppercase"
                  onClick={() => setShowCheckoutModal(true)}
                >
                  Proceed to Checkout
                </button>
                <Link to="/" className="btn btn-outline-dark w-100 mt-2">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 4. SHOPPING CART CHECKOUT MODAL WINDOW ── */}
      {showCheckoutModal && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowCheckoutModal(false)} style={{ zIndex: 1040 }} />
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content text-dark bg-white" style={{ borderRadius: "14px" }}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Confirm Delivery Details</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCheckoutModal(false)} />
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Checkout Summary</label>
                    <div className="p-3 bg-light rounded">
                      <div className="text-secondary small">Total Cart Items: <strong>{cart.items.length} product entries</strong></div>
                      <div className="fs-4 text-success fw-bold mt-1">Payable Balance: ₹{cart.totalAmount?.toLocaleString("en-IN")}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Payment Mode</label>
                    <select
                      className="form-select bg-white text-dark"
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                    >
                      <option value="COD">Cash on Delivery (COD)</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label fw-semibold">Shipping Address</label>
                    <textarea
                      className="form-control bg-white text-dark custom-cart-input"
                      rows="3"
                      placeholder="Enter your complete home or campus hostel address details..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn btn-outline-secondary" onClick={() => setShowCheckoutModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-success fw-bold px-4" onClick={handleCartCheckout} disabled={checkingOut}>
                    {checkingOut ? (
                      <><span className="spinner-border spinner-border-sm me-2" />Placing...</>
                    ) : (
                      "Place Order"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 🛡️ FORCE INTERCEPT STATE OVERRIDES & RENDER FIXES */}
      <style>{`
        .custom-cart-input,
        .custom-cart-input:hover,
        .custom-cart-input:active,
        .custom-cart-input:focus {
          color: #212529 !important;
          background-color: #ffffff !important;
          color-scheme: light !important;
          opacity: 1 !important;
          visibility: visible !important;
          -webkit-text-fill-color: #212529 !important; /* 🔥 Overrides hidden autofill/focus masks */
          caret-color: #212529 !important;              /* Ensures the typing cursor stays visible */
        }
        
        .custom-cart-input:focus {
          border-color: #198754 !important;
          box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25) !important;
        }
      `}</style>
      <Footer />
    </>
  );
}

export default Cart;