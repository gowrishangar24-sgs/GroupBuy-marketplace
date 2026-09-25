import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import axios from "axios";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // ── 1. ALL REACT HOOKS DECLARED AT THE VERY TOP ──
  const [item, setItem] = useState(null);
  const [itemType, setItemType] = useState(null); // "product" | "deal"
  const [selectedTier, setSelectedTier] = useState(null);
  const [joining, setJoining] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Buy Now Feature States
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [paymentMode, setPaymentMode] = useState("COD");
  const [address, setAddress] = useState("");

  useEffect(() => {
    axios
      .get(`/products/${id}`)
      .then((res) => {
        if (res.data.success && res.data.product) {
          setItem(res.data.product);
          setItemType("product");
        }
      })
      .catch(() => {
        axios
          .get(`/deals/${id}`)
          .then((res) => {
            if (res.data.success && res.data.deal) {
              const d = res.data.deal;
              setItem(d);
              setItemType("deal");
              if (Array.isArray(d.tiers) && d.tiers.length > 0) {
                const sorted = [...d.tiers].sort(
                  (a, b) => (a.minUsers || a.targetMinBuyers) - (b.minUsers || b.targetMinBuyers)
                );
                const firstUnlocked = sorted.find(
                  (t) => (d.joinedUsers || 0) < (t.minUsers || t.targetMinBuyers)
                );
                setSelectedTier(firstUnlocked || null);
              }
            }
          })
          .catch((err) => console.log("Item not found:", err));
      });
  }, [id]);

  useEffect(() => {
    if (itemType === "deal" && item && Array.isArray(item.tiers) && item.tiers.length > 0) {
      const sorted = [...item.tiers].sort(
        (a, b) => (a.minUsers || a.targetMinBuyers) - (b.minUsers || b.targetMinBuyers)
      );
      const firstUnlocked = sorted.find(
        (t) => (item.joinedUsers || 0) < (t.minUsers || t.targetMinBuyers)
      );
      const currentTierMin = selectedTier ? (selectedTier.minUsers || selectedTier.targetMinBuyers) : null;
      if (!selectedTier || (currentTierMin !== null && (item.joinedUsers || 0) >= currentTierMin)) {
        setSelectedTier(firstUnlocked || null);
      }
    }
  }, [item, itemType]);

  const requireLogin = (action) => {
    if (!user) {
      alert("Please login to " + action);
      navigate("/login");
      return false;
    }
    return true;
  };

  // ── 2. HELPER ACTION HANDLERS ──
  const openBuyNow = () => {
    if (!requireLogin("buy this product")) return;
    setShowBuyModal(true);
  };

  const placeOrder = async () => {
    if (!address.trim()) {
      alert("Please enter your shipping address");
      return;
    }
    setBuyingNow(true);
    try {
      await axios.post(
        "/orders/create",
        { productId: id, quantity: 1, shippingAddress: address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Order Placed");
      setShowBuyModal(false);
      setAddress("");
      navigate("/account");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to place order");
    } finally {
      setBuyingNow(false);
    }
  };

  const joinDeal = async () => {
    if (!requireLogin("join a deal")) return;
    const userId = user?._id || user?.id;
    const alreadyJoined =
      Boolean(userId) &&
      Array.isArray(item?.participants) &&
      item.participants.some(
        (p) =>
          p.user === userId ||
          p.user?._id === userId ||
          p.user?.id === userId ||
          p === userId ||
          (typeof p.user === "string" && p.user === userId?.toString()) ||
          (p.user?._id && p.user._id.toString() === userId?.toString())
      );
    if (alreadyJoined) {
      alert("You have already pledged for this deal!");
      return;
    }
    if (!selectedTier) {
      alert("Please select an unlocked milestone pricing tier");
      return;
    }
    setJoining(true);

    const targetMembers = Number(selectedTier?.minUsers || selectedTier?.targetMembers || selectedTier?.targetMinBuyers || 5);

    const payload = {
      dealId: item._id,
      tierId: selectedTier?._id || selectedTier?.id,
      price: selectedTier?.price || item?.price,
      selectedTierPrice: selectedTier?.price || item?.price,
      targetMinBuyers: targetMembers,
      targetMembers: targetMembers,
    };

    try {
      const res = await axios.post(
        `/deals/${id}/join`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedDeal = res.data.deal;
      if (res.data.poolReset || updatedDeal?.joinedUsers === 0) {
        setItem({
          ...updatedDeal,
          joinedUsers: 0,
          participants: [],
        });
      } else {
        setItem(updatedDeal);
      }
      if (Array.isArray(updatedDeal?.tiers) && updatedDeal.tiers.length > 0) {
        const sorted = [...updatedDeal.tiers].sort(
          (a, b) => (a.minUsers || a.targetMinBuyers) - (b.minUsers || b.targetMinBuyers)
        );
        const firstUnlocked = sorted.find(
          (t) => (updatedDeal.joinedUsers || 0) < (t.minUsers || t.targetMinBuyers)
        );
        setSelectedTier(firstUnlocked || null);
      }
      alert(res.data.message || "Successfully pledged your order for the group deal!");
      navigate("/orders");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to join deal");
    } finally {
      setJoining(false);
    }
  };

  const addToCart = async () => {
    if (!requireLogin("add to cart")) return;
    setAddingToCart(true);
    try {
      await axios.post(
        "/cart/add",
        { productId: id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Added to cart!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const addToWishlist = async () => {
    if (!requireLogin("add to wishlist")) return;
    setAddingToWishlist(true);
    try {
      await axios.post(
        "/wishlist/add",
        { productId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Added to wishlist!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add to wishlist");
    } finally {
      setAddingToWishlist(false);
    }
  };

  // ── 3. EARLY CONDITIONAL RETURNS (MUST COME AFTER ALL HOOKS/FUNCTIONS) ──
  if (!item) {
    return (
      <>
        <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <div
          className="container py-5 text-center d-flex flex-column align-items-center justify-content-center"
          style={{ minHeight: "60vh" }}
        >
          <div className="spinner-border text-success" style={{ width: "3rem", height: "3rem" }} />
          <p className="mt-3 text-muted">Loading...</p>
        </div>
        <Footer />
      </>
    );
  }

  // ── 4. RENDER PRESENTATION VIEW FOR STANDARD PRODUCTS ──
  if (itemType === "product") {
    const outOfStock = item.stock === 0;
    return (
      <>
        <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <div className="container py-5">
          <div className="card shadow-lg border-0 p-4 rounded-4">
            <div className="row g-4 align-items-start">
              <div className="col-md-5">
                <div className="bg-light rounded-3 text-center p-3">
                  <img
                    src={item.image || "/shopping.png"}
                    alt={item.title}
                    className="img-fluid rounded"
                    style={{ maxHeight: "420px", objectFit: "contain", width: "100%" }}
                  />
                </div>
              </div>

              <div className="col-md-7">
                <span className="badge bg-dark mb-2">{item.category}</span>
                <h2 className="fw-bold mb-2 text-dark">{item.title}</h2>
                <p className="text-muted mb-3">
                  Sold by <strong>{item.seller || "GroupBuy Store"}</strong>
                </p>

                <div className="d-flex align-items-center gap-3 mb-4">
                  <h2 className="text-success fw-bold m-0">
                    ₹{item.price?.toLocaleString("en-IN")}
                  </h2>
                  {outOfStock ? (
                    <span className="badge bg-danger px-3 py-2">Out of Stock</span>
                  ) : (
                    <span className="badge bg-success px-3 py-2">{item.stock} in stock</span>
                  )}
                </div>

                {item.description && (
                  <div className="mb-4">
                    <h6 className="fw-bold text-uppercase text-muted small mb-2">Description</h6>
                    <p className="text-muted border-start border-3 ps-3">{item.description}</p>
                  </div>
                )}

                <div className="d-flex flex-column gap-2">
                  <button
                    className="btn btn-dark btn-lg fw-bold py-3"
                    onClick={openBuyNow}
                    disabled={outOfStock}
                    style={{ borderRadius: "10px" }}
                  >
                    {outOfStock ? "Out of Stock" : "⚡ Buy Now"}
                  </button>

                  <button
                    className="btn btn-success btn-lg fw-bold py-3"
                    onClick={addToCart}
                    disabled={addingToCart || outOfStock}
                    style={{ borderRadius: "10px" }}
                  >
                    {addingToCart ? (
                      <><span className="spinner-border spinner-border-sm me-2" />Adding...</>
                    ) : outOfStock ? (
                      "Out of Stock"
                    ) : (
                      "🛒 Add to Cart"
                    )}
                  </button>

                  <button
                    className="btn btn-outline-danger fw-bold"
                    onClick={addToWishlist}
                    disabled={addingToWishlist}
                    style={{ borderRadius: "10px" }}
                  >
                    {addingToWishlist ? (
                      <><span className="spinner-border spinner-border-sm me-2" />Adding...</>
                    ) : (
                      "❤️ Add to Wishlist"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CHECKOUT MODAL INTERFACE ELEMENT */}
        {showBuyModal && (
          <>
            <div className="modal-backdrop fade show" onClick={() => setShowBuyModal(false)} style={{ zIndex: 1040 }} />
            <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content text-dark bg-white" style={{ borderRadius: "14px" }}>
                  <div className="modal-header">
                    <h5 className="modal-title fw-bold">Complete Your Order</h5>
                    <button type="button" className="btn-close" onClick={() => setShowBuyModal(false)} />
                  </div>

                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Product</label>
                      <div className="d-flex align-items-center gap-2 p-2 bg-light rounded">
                        <img
                          src={item.image || "/shopping.png"}
                          alt={item.title}
                          style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "6px" }}
                        />
                        <div>
                          <div className="fw-semibold text-truncate" style={{ maxWidth: "320px" }}>{item.title}</div>
                          <div className="text-success fw-bold">₹{item.price?.toLocaleString("en-IN")}</div>
                        </div>
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
                        className="form-control bg-white text-dark custom-add-input"
                        rows="3"
                        placeholder="Enter your full delivery address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button className="btn btn-outline-secondary" onClick={() => setShowBuyModal(false)}>
                      Cancel
                    </button>
                    <button className="btn btn-success fw-bold px-4" onClick={placeOrder} disabled={buyingNow}>
                      {buyingNow ? (
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

       {/* 🛡️ STYLING FIX TO PREVENT INVISIBLE TYPING INSIDE MODAL */}
        <style>{`
          .custom-add-input,
          .custom-add-input:hover,
          .custom-add-input:active,
          .custom-add-input:focus {
            color: #212529 !important;
            background-color: #ffffff !important;
            color-scheme: light !important;
            opacity: 1 !important;
            visibility: visible !important;
            -webkit-text-fill-color: #212529 !important; /* 🔥 Overrides focus masking */
            caret-color: #212529 !important;              /* Ensures cursor stays visible */
          }

          .custom-add-input:focus {
            border-color: #198754 !important;
            box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25) !important;
          }
        `}</style>

        <Footer />
      </>
    );
  }

  // ── 5. RENDER PRESENTATION VIEW FOR GROUP DEALS ──
  const joinedUsers = item.joinedUsers ?? 0;
  const targetMembers = item.targetMembers ?? 0;

  const groupPrice =
    item.activeTierPrice !== undefined && item.activeTierPrice !== null
      ? item.activeTierPrice
      : item.tiers && item.tiers.length > 0 
        ? [...item.tiers].sort((a, b) => b.minUsers - a.minUsers).find((t) => joinedUsers >= t.minUsers)?.price || item.tiers[item.tiers.length - 1].price
        : null;

  const progress = targetMembers > 0 ? Math.min((joinedUsers / targetMembers) * 100, 100) : 0;
  const discount = item.originalPrice && groupPrice ? Math.round(((item.originalPrice - groupPrice) / item.originalPrice) * 100) : 0;
  
  const currentTarget = selectedTier
    ? (selectedTier.minUsers || selectedTier.targetMinBuyers || targetMembers || 1)
    : (targetMembers || 1);
  const isFull = joinedUsers > 0 && joinedUsers >= currentTarget;

  const userId = user?._id || user?.id;
  const hasJoined =
    Boolean(userId) &&
    Array.isArray(item?.participants) &&
    item.participants.some(
      (p) =>
        p.user === userId ||
        p.user?._id === userId ||
        p.user?.id === userId ||
        p === userId ||
        (typeof p.user === "string" && p.user === userId?.toString()) ||
        (p.user?._id && p.user._id.toString() === userId?.toString())
    );

  const nextTier = Array.isArray(item.tiers) && item.tiers.length > 0
      ? [...item.tiers].sort((a, b) => a.minUsers - b.minUsers).find((t) => t.minUsers > joinedUsers)
      : null;

  return (
    <>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="container py-5">
        <div className="card shadow-lg border-0 p-4 rounded-4 bg-white">
          <div className="row g-4 align-items-center">
            <div className="col-md-6">
              <div className="p-2 border rounded-3 text-center bg-light">
                <img
                  src={item.image || "/shopping.png"}
                  alt={item.title}
                  className="img-fluid rounded"
                  style={{ width: "100%", maxHeight: "450px", objectFit: "contain" }}
                />
              </div>
            </div>

            <div className="col-md-6">
              <span className={`badge mb-3 px-3 py-2 fs-6 rounded-pill ${item.status === "completed" ? "bg-success" : item.status === "cancelled" ? "bg-danger" : "bg-warning text-dark"}`}>
                🏁 {item.status?.toUpperCase() || "ACTIVE"}
              </span>

              <h2 className="fw-bold mb-3 text-dark">{item.title}</h2>

              <div className="card p-3 border-0 bg-light rounded-3 mb-3 d-flex flex-row align-items-center justify-content-between flex-wrap gap-2">
                <div>
                  <small className="text-secondary d-block fw-semibold text-uppercase">Current Group Price</small>
                  <h3 className="text-success fw-bold m-0 display-6">₹{groupPrice !== null ? groupPrice : "—"}</h3>
                </div>
                <div className="text-end">
                  <small className="text-secondary d-block text-uppercase">Retail</small>
                  <span className="text-muted text-decoration-line-through fs-5">₹{item.originalPrice}</span>
                </div>
                {discount > 0 && (
                  <span className="badge bg-danger fs-5 px-3 py-2 rounded-3">🔥 {discount}% OFF</span>
                )}
              </div>

              {Array.isArray(item.tiers) && item.tiers.length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-bold text-uppercase text-muted small mb-3">
                    🏷️ Milestone Pricing Tiers (Select to Pledge):
                  </h6>
                  <div className="d-flex flex-column gap-3">
                    {[...item.tiers]
                      .sort((a, b) => (a.minUsers || a.targetMinBuyers) - (b.minUsers || b.targetMinBuyers))
                      .map((tier, i) => {
                        const minReq = tier.minUsers || tier.targetMinBuyers || 1;
                        const isLocked = joinedUsers >= minReq;
                        const displayCount = Math.min(joinedUsers, minReq);
                        const isSelected =
                          !isLocked &&
                          selectedTier &&
                          selectedTier.price === tier.price &&
                          ((selectedTier.minUsers || selectedTier.targetMinBuyers) === minReq);
                        const savings = item.originalPrice ? item.originalPrice - tier.price : 0;
                        const savingsPercent = item.originalPrice && item.originalPrice > 0
                          ? Math.round((savings / item.originalPrice) * 100)
                          : 0;

                        return (
                          <div
                            key={i}
                            className={`p-3 rounded-3 border ${
                              isLocked
                                ? "border-secondary-subtle bg-light text-muted opacity-75"
                                : isSelected
                                ? "border-success bg-success-subtle shadow-sm cursor-pointer"
                                : "border-light-subtle bg-light text-dark cursor-pointer"
                            }`}
                            onClick={() => {
                              if (!isLocked) setSelectedTier(tier);
                            }}
                            style={{
                              cursor: isLocked ? "not-allowed" : "pointer",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
                              <div className="d-flex align-items-start gap-3">
                                <input
                                  type="radio"
                                  name="dealTierOption"
                                  checked={!!isSelected}
                                  disabled={isLocked}
                                  onChange={() => {
                                    if (!isLocked) setSelectedTier(tier);
                                  }}
                                  className="form-check-input mt-1"
                                  style={{ transform: "scale(1.2)" }}
                                />
                                <div>
                                  <div className="d-flex align-items-center gap-2 flex-wrap">
                                    <h5 className={`fw-bold m-0 ${isLocked ? "text-muted" : "text-success"}`}>
                                      ₹{tier.price?.toLocaleString("en-IN")}
                                    </h5>
                                    {savings > 0 && (
                                      <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill small">
                                        Save ₹{savings.toLocaleString("en-IN")} ({savingsPercent}% OFF)
                                      </span>
                                    )}
                                  </div>
                                  <small className="text-secondary fw-medium d-block mt-1">
                                    Requires minimum <strong>{minReq}</strong> buyers
                                  </small>
                                </div>
                              </div>

                              <div className="text-end">
                                <span
                                  className={`badge ${
                                    isLocked
                                      ? "bg-secondary text-white"
                                      : "bg-primary-subtle text-primary border border-primary-subtle"
                                  } px-3 py-2 rounded-pill fs-7`}
                                >
                                  👥 {displayCount} / {minReq} {isLocked ? "Filled" : "pledged"}
                                </span>
                                {isSelected && !isLocked && (
                                  <small className="d-block text-success fw-bold mt-1">
                                    ✓ Selected
                                  </small>
                                )}
                                {isLocked && (
                                  <div className="mt-1">
                                    <span className="badge bg-dark text-white rounded-pill px-2 py-1 small">
                                      🔒 Locked
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {nextTier && (
                <div className="alert alert-info py-2 small mb-3">
                  🔓 <strong>{nextTier.minUsers - joinedUsers}</strong> more member(s) unlock ₹{nextTier.price?.toLocaleString("en-IN")}
                </div>
              )}

              <div className="alert alert-warning border-0 py-3 mb-4 d-flex align-items-center gap-2 rounded-3">
                <span className="fs-4">⏰</span>
                <div>
                  <strong>{item.daysLeft ?? 0} Days Remaining</strong>
                  <div className="small text-muted">Pool auto-resolves at deadline</div>
                </div>
              </div>

              {(() => {
                const currentTarget = selectedTier 
                  ? (selectedTier.minUsers || selectedTier.targetMinBuyers || item?.targetMembers || 1) 
                  : (item?.targetMembers || 1);

                const progressPercentage = Math.min(
                  100, 
                  Math.round(((item?.joinedUsers || 0) / currentTarget) * 100)
                );
                const isTargetReached = (item?.joinedUsers || 0) >= currentTarget;

                return (
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="fw-bold text-secondary">
                        👥 Current Progress: <strong className="text-dark">{joinedUsers} / {currentTarget} buyers joined</strong>
                      </span>
                      <span className="text-muted">{progressPercentage}%</span>
                    </div>
                    <div className="progress mb-2" style={{ height: "16px", borderRadius: "20px" }}>
                      <div
                        className={`progress-bar progress-bar-striped progress-bar-animated ${
                          isTargetReached ? "bg-success" : "bg-primary bg-gradient"
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
{(() => {
  let btnText = "";
  let btnClass = "";
  let btnDisabled = false;

  // 1. Only consider completed if participants actually exist (> 0)
  const isDealCompleted = (joinedUsers > 0) && (item.status === "completed" || isFull);

  // 2. Accept both "active" and "open" (and fallback if status is omitted)
  const isDealActive = !item.status || item.status === "active" || item.status === "open";

  if (joining) {
    btnText = "Pledging...";
    btnClass = "btn-secondary";
    btnDisabled = true;
  } else if (isDealCompleted) {
    btnText = "🔒 Deal Completed • Orders Placed";
    btnClass = "btn-secondary";
    btnDisabled = true;
  } else if (hasJoined && joinedUsers > 0) {
    btnText = "✓ Order Placed";
    btnClass = "btn-success";
    btnDisabled = true;
  } else if (!isDealActive) {
    btnText = "🔒 Deal Closed";
    btnClass = "btn-secondary";
    btnDisabled = true;
  } else if (!selectedTier) {
    btnText = "Select a Tier to Pledge";
    btnClass = "btn-secondary";
    btnDisabled = true;
  } else {
    btnText = `Pledge Deal at ₹${selectedTier.price?.toLocaleString("en-IN")}`;
    btnClass = "btn-success shadow";
    btnDisabled = false;
  }

  return (
    <button
      className={`btn btn-lg w-100 py-3 fw-bold rounded-3 mb-3 ${btnClass}`}
      onClick={joinDeal}
      disabled={btnDisabled}
    >
      {btnText}
    </button>
  );
})()}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProductDetails;