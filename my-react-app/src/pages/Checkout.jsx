import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  // Retrieve state passed from ProductDetails.jsx
  const stateData = location.state || {};
  const {
    dealId,
    title,
    image,
    price = 0,
    selectedPrice = 0,
    selectedTier,
    tierId,
    targetMembers = 5,
    originalPrice = 0,
  } = stateData;

  const itemPrice = selectedPrice || price || originalPrice || 0;

  // Form states
  const [fullName, setFullName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalPrice = itemPrice * quantity;

  // Handle Order Submission
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      alert("Please log in to complete your order.");
      navigate("/login");
      return;
    }

    if (!fullName.trim()) {
      setError("Full Name is required.");
      return;
    }
    if (!phone.trim()) {
      setError("Phone Number is required.");
      return;
    }
    if (!address.trim()) {
      setError("Delivery Address is required.");
      return;
    }
    if (!city.trim()) {
      setError("City is required.");
      return;
    }
    if (!pinCode.trim()) {
      setError("PIN code is required.");
      return;
    }

    setSubmitting(true);

    const fullShippingAddress = `${fullName}, Ph: ${phone}, ${address}, ${city} - ${pinCode}`;

    const payload = {
      dealId: dealId,
      tierId: tierId || selectedTier?._id || selectedTier?.id,
      price: itemPrice,
      selectedTierPrice: itemPrice,
      targetMinBuyers: targetMembers,
      targetMembers: targetMembers,
      shippingAddress: fullShippingAddress,
      quantity: quantity,
      paymentMethod: paymentMethod,
    };

    try {
      const res = await axios.post(`/deals/${dealId}/join`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success || res.status === 200) {
        setSuccess("Order Placed Successfully!");
        alert("Order Placed Successfully!");
        navigate("/orders");
      } else {
        setError(res.data.message || "Failed to place order.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to place order.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // If accessed directly without a deal item in state
  if (!dealId) {
    return (
      <>
        <Navbar />
        <div className="container py-5 text-center my-5">
          <div className="card shadow-sm p-5 max-w-md mx-auto rounded-4 border-0">
            <div className="fs-1 mb-3">🛍️</div>
            <h3 className="fw-bold mb-2">No Active Deal Selected</h3>
            <p className="text-muted mb-4">Please select a deal from our products catalog to proceed to checkout.</p>
            <Link to="/" className="btn btn-primary btn-lg rounded-3 px-4">
              Browse Hot Deals
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="bg-light py-5">
        <div className="container">
          <div className="d-flex align-items-center gap-2 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "36px", height: "36px" }}
            >
              ←
            </button>
            <h2 className="fw-bold mb-0">Group Deal Checkout</h2>
          </div>

          {error && (
            <div className="alert alert-danger border-0 rounded-3 shadow-sm mb-4 d-flex align-items-center gap-2">
              <span>⚠️</span>
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div className="alert alert-success border-0 rounded-3 shadow-sm mb-4 d-flex align-items-center gap-2">
              <span>🎉</span>
              <div>{success}</div>
            </div>
          )}

          <div className="row g-4">
            {/* Left Column: Shipping & Payment Form */}
            <div className="col-lg-7">
              <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <span className="badge bg-primary rounded-circle px-2 py-1 fs-6">1</span>
                  Delivery Information
                </h4>
                <form onSubmit={handlePlaceOrder}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Full Name *</label>
                      <input
                        type="text"
                        className="form-control rounded-3 py-2"
                        placeholder="e.g. John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Phone Number *</label>
                      <input
                        type="tel"
                        className="form-control rounded-3 py-2"
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Street Address *</label>
                      <textarea
                        className="form-control rounded-3"
                        rows="2"
                        placeholder="House no., Building, Street, Area"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">City *</label>
                      <input
                        type="text"
                        className="form-control rounded-3 py-2"
                        placeholder="e.g. Mumbai"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">PIN Code *</label>
                      <input
                        type="text"
                        className="form-control rounded-3 py-2"
                        placeholder="6-digit postal code"
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <hr className="my-4 text-muted opacity-25" />

                  <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <span className="badge bg-primary rounded-circle px-2 py-1 fs-6">2</span>
                    Payment Method
                  </h4>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <div
                        className={`card h-100 border-2 rounded-3 p-3 cursor-pointer ${
                          paymentMethod === "COD" ? "border-primary bg-primary bg-opacity-10" : "border-light"
                        }`}
                        onClick={() => setPaymentMethod("COD")}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="paymentMethod"
                            id="cod"
                            checked={paymentMethod === "COD"}
                            onChange={() => setPaymentMethod("COD")}
                          />
                          <label className="form-check-label fw-bold cursor-pointer" htmlFor="cod">
                            💵 Cash on Delivery (COD)
                          </label>
                          <div className="small text-muted mt-1">Pay when your group order deal confirms</div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div
                        className={`card h-100 border-2 rounded-3 p-3 cursor-pointer ${
                          paymentMethod === "UPI" ? "border-primary bg-primary bg-opacity-10" : "border-light"
                        }`}
                        onClick={() => setPaymentMethod("UPI")}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="paymentMethod"
                            id="upi"
                            checked={paymentMethod === "UPI"}
                            onChange={() => setPaymentMethod("UPI")}
                          />
                          <label className="form-check-label fw-bold cursor-pointer" htmlFor="upi">
                            📱 UPI / Google Pay / PhonePe
                          </label>
                          <div className="small text-muted mt-1">Fast & Instant Payment Authorization</div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div
                        className={`card h-100 border-2 rounded-3 p-3 cursor-pointer ${
                          paymentMethod === "Card" ? "border-primary bg-primary bg-opacity-10" : "border-light"
                        }`}
                        onClick={() => setPaymentMethod("Card")}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="paymentMethod"
                            id="card"
                            checked={paymentMethod === "Card"}
                            onChange={() => setPaymentMethod("Card")}
                          />
                          <label className="form-check-label fw-bold cursor-pointer" htmlFor="card">
                            💳 Credit / Debit Card
                          </label>
                          <div className="small text-muted mt-1">Visa, Mastercard, RuPay accepted</div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div
                        className={`card h-100 border-2 rounded-3 p-3 cursor-pointer ${
                          paymentMethod === "NetBanking" ? "border-primary bg-primary bg-opacity-10" : "border-light"
                        }`}
                        onClick={() => setPaymentMethod("NetBanking")}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="paymentMethod"
                            id="netbanking"
                            checked={paymentMethod === "NetBanking"}
                            onChange={() => setPaymentMethod("NetBanking")}
                          />
                          <label className="form-check-label fw-bold cursor-pointer" htmlFor="netbanking">
                            🏦 Net Banking
                          </label>
                          <div className="small text-muted mt-1">All major Indian banks supported</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-success btn-lg w-100 py-3 fw-bold rounded-3 shadow"
                  >
                    {submitting ? "Processing Order..." : `Place Order • ₹${totalPrice.toLocaleString("en-IN")}`}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="col-lg-5">
              <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: "90px" }}>
                <h4 className="fw-bold mb-3 border-bottom pb-3">Order Summary</h4>

                <div className="d-flex gap-3 align-items-center mb-3">
                  <img
                    src={image || "https://via.placeholder.com/80"}
                    alt={title}
                    className="rounded-3 border object-cover"
                    style={{ width: "80px", height: "80px", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/80";
                    }}
                  />
                  <div>
                    <h6 className="fw-bold mb-1 text-truncate" style={{ maxWidth: "220px" }}>
                      {title}
                    </h6>
                    <span className="badge bg-info text-dark rounded-pill">
                      👥 Target: {targetMembers} Buyers
                    </span>
                  </div>
                </div>

                <div className="bg-light p-3 rounded-3 mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted fw-semibold">Quantity</span>
                    <div className="d-flex align-items-center border rounded bg-white">
                      <button
                        type="button"
                        className="btn btn-sm btn-light border-0 px-2 fw-bold"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        -
                      </button>
                      <span className="px-3 fw-bold">{quantity}</span>
                      <button
                        type="button"
                        className="btn btn-sm btn-light border-0 px-2 fw-bold"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Unlocked Group Price</span>
                    <span className="fw-bold text-dark">₹{itemPrice.toLocaleString("en-IN")}</span>
                  </div>

                  {originalPrice > itemPrice && (
                    <div className="d-flex justify-content-between mb-2 small">
                      <span className="text-muted">Original Market Price</span>
                      <span className="text-decoration-line-through text-muted">
                        ₹{(originalPrice * quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  <div className="d-flex justify-content-between mb-0 text-success small fw-semibold">
                    <span>Shipping & Group Logistics</span>
                    <span>FREE 🎉</span>
                  </div>
                </div>

                <hr className="my-2" />

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div className="fw-bold fs-5">Total Payable</div>
                    <div className="small text-muted">Includes all taxes & group discount</div>
                  </div>
                  <div className="fs-3 fw-bold text-success">₹{totalPrice.toLocaleString("en-IN")}</div>
                </div>

                <div className="alert alert-info py-2 px-3 mb-0 rounded-3 small">
                  🛡️ <strong>Group Protection:</strong> Your order automatically locks and confirms when the milestone of {targetMembers} buyers is reached.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Checkout;
