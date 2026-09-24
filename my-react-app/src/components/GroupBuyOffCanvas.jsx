import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function GroupBuyOffcanvas({ isOpen, onClose, searchTerm, setSearchTerm }) {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(searchTerm || "");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    setSearchInput(searchTerm || "");
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchInput?.trim();
    if (q) {
      if (setSearchTerm) setSearchTerm(q);
      navigate(`/search?q=${encodeURIComponent(q)}`);
      onClose();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <>
      {isOpen && (
        <div
          className="offcanvas-backdrop fade show"
          onClick={onClose}
          style={{ zIndex: 1040 }}
        />
      )}

      <div
        className={`offcanvas offcanvas-start ${isOpen ? "show" : ""}`}
        style={{
          visibility: isOpen ? "visible" : "hidden",
          width: "320px",
          maxWidth: "85vw",
          zIndex: 1050
        }}
      >
        {/* Header */}
        <div
          className="offcanvas-header text-white"
          style={{ backgroundColor: "#212529" }}
        >
          <h5 className="offcanvas-title fs-6 m-0">
            👋 {user ? `Hello, ${user.name?.split(" ")[0]}` : "Welcome to GroupBuy"}
          </h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={onClose}
          />
        </div>

        <div className="offcanvas-body p-3">
          
          {/* 🔍 SEARCH BAR */}
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search products, deals..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button className="btn btn-success" type="submit">
                🔍
              </button>
            </div>
          </form>

          {/* 🔑 LOGIN / SIGN UP (when logged out) */}
          {!user && (
            <div className="p-3 bg-light rounded-3 mb-3 border">
              <p className="small text-muted mb-2 fw-medium">Access your account or register:</p>
              <div className="d-flex gap-2">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="btn btn-outline-dark flex-fill btn-sm py-2 fw-semibold"
                  style={{ borderRadius: "8px" }}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={onClose}
                  className="btn btn-success flex-fill btn-sm py-2 fw-semibold"
                  style={{ borderRadius: "8px" }}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}

          {/* 💼 SELLER CENTER (DYNAMIC) */}
          {user && (user.role === "seller" || user.role === "admin") && (
            <div className="py-2 border-bottom">
              <h6 className="fw-bold mb-2 text-secondary text-uppercase small tracking-wider">
                Seller Center
              </h6>
              <div className="list-group list-group-flush">
                <Link
                  to="/SellerDashboard"
                  onClick={onClose}
                  className="list-group-item list-group-item-action border-0 ps-0 py-2"
                >
                  📊 Seller Dashboard
                </Link>
                <Link
                  to="/AddProduct"
                  onClick={onClose}
                  className="list-group-item list-group-item-action border-0 ps-0 py-2"
                >
                  📦 Add Product
                </Link>
                <Link
                  to="/CreateDeal"
                  onClick={onClose}
                  className="list-group-item list-group-item-action border-0 ps-0 py-2"
                >
                  🚀 Create Deal
                </Link>
                <Link
                  to="/MyDeals"
                  onClick={onClose}
                  className="list-group-item list-group-item-action border-0 ps-0 py-2"
                >
                  🤝 My Deals
                </Link>
              </div>
            </div>
          )}

          {/* 👤 MY ACCOUNT / NAVIGATION */}
          <div className="py-2 border-bottom">
            <h6 className="fw-bold mb-2 text-secondary text-uppercase small tracking-wider">
              My Account
            </h6>
            <div className="list-group list-group-flush">
              <Link
                to="/account"
                onClick={onClose}
                className="list-group-item list-group-item-action border-0 ps-0 py-2"
              >
                👤 Profile
              </Link>
              <Link
                to="/cart"
                onClick={onClose}
                className="list-group-item list-group-item-action border-0 ps-0 py-2"
              >
                🛒 Cart
              </Link>
              <Link
                to="/wishlist"
                onClick={onClose}
                className="list-group-item list-group-item-action border-0 ps-0 py-2"
              >
                ❤️ Wishlist
              </Link>
              <Link
                to="/orders"
                onClick={onClose}
                className="list-group-item list-group-item-action border-0 ps-0 py-2"
              >
                📦 Orders
              </Link>
            </div>
          </div>

          {/* ⚙️ HELP & SUPPORT */}
          <div className="py-2">
            <h6 className="fw-bold mb-2 text-secondary text-uppercase small tracking-wider">
              Help & Support
            </h6>
            <div className="list-group list-group-flush">
              <Link
                to="/contact-us"
                onClick={onClose}
                className="list-group-item list-group-item-action border-0 ps-0 py-2"
              >
                📞 Contact Us
              </Link>
              <Link
                to="/faqs"
                onClick={onClose}
                className="list-group-item list-group-item-action border-0 ps-0 py-2"
              >
                ❓ FAQ
              </Link>
              {user && (
                <button
                  className="list-group-item list-group-item-action border-0 ps-0 py-2 text-danger fw-bold text-start bg-transparent"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default GroupBuyOffcanvas;