import React from "react";
import { Link } from "react-router-dom";

function GroupBuyOffcanvas({ isOpen, onClose }) {
  const user = JSON.parse(localStorage.getItem("user"));

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
          width: "350px",
          zIndex: 1050
        }}
      >
        {/* Header */}
        <div
          className="offcanvas-header text-white"
          style={{ backgroundColor: "#212529" }}
        >
          <h5 className="offcanvas-title">
            👋 Hello, {user ? user.name : "User"}
          </h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={onClose}
          />
        </div>

        <div className="offcanvas-body p-0">
          
          {/* 💼 SELLER CENTER (DYNAMIC) */}
          {user && (user.role === "seller" || user.role === "admin") && (
            <div className="p-3 border-bottom">
              <h6 className="fw-bold mb-3 text-secondary text-uppercase small tracking-wider">
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

          {/* 👤 MY ACCOUNT (DYNAMIC) */}
          <div className="p-3 border-bottom">
            <h6 className="fw-bold mb-3 text-secondary text-uppercase small tracking-wider">
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
                to="/account"
                onClick={onClose}
                className="list-group-item list-group-item-action border-0 ps-0 py-2"
              >
                📦 Orders
              </Link>
              <Link
                to="/wishlist"
                onClick={onClose}
                className="list-group-item list-group-item-action border-0 ps-0 py-2"
              >
                ❤️ Wishlist
              </Link>
            </div>
          </div>

          {/* ⚙️ HELP & SUPPORT */}
          <div className="p-3">
            <h6 className="fw-bold mb-3 text-secondary text-uppercase small tracking-wider">
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
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/";
                  }}
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