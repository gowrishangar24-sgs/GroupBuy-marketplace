import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import GroupBuyOffcanvas from "./GroupBuyOffCanvas";

function Navbar({ searchTerm, setSearchTerm }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user || !token) return;

    axios
      .get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.success) {
          const items = res.data.cart?.items || [];
          setCartCount(items.reduce((sum, i) => sum + i.quantity, 0));
        }
      })
      .catch(() => {});

    axios
      .get("/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.success) {
          const items = res.data.wishlist?.products || [];
          setWishlistCount(items.length);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <>
      <nav className="navbar navbar-dark bg-black sticky-top shadow-sm py-2 px-3">
        <div className="container-fluid px-0 d-flex align-items-center justify-content-between flex-nowrap gap-3">
          
          {/* 1. Left: Brand Logo */}
          <Link className="navbar-brand fw-bold flex-shrink-0 m-0" to="/">
            <img
              src="/title.png"
              alt="GroupBuy"
              style={{ height: "clamp(28px, 4vw, 40px)", objectFit: "contain" }}
            />
          </Link>

          {/* 2. Center: Search Bar (Aligned in the same row) */}
          <form
            className="d-flex flex-grow-1 mx-2"
            style={{ maxWidth: "520px" }}
            onSubmit={(e) => {
              e.preventDefault();
              const q = searchTerm?.trim();
              if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
            }}
          >
            <div className="input-group">
              <input
                className="form-control border-0 bg-white"
                type="text"
                placeholder="Search products, deals, categories..."
                value={setSearchTerm ? (searchTerm || "") : ""}
                onChange={(e) => {
                  if (setSearchTerm) {
                    setSearchTerm(e.target.value);
                  }
                }}
                style={{ borderRadius: "8px 0 0 8px", fontSize: "14px" }}
              />
              <button
                className="btn btn-success px-3"
                type="submit"
                style={{ borderRadius: "0 8px 8px 0" }}
              >
                🔍
              </button>
            </div>
          </form>

          {/* 3. Right: Desktop Actions & Mobile Menu Toggle */}
          <div className="d-flex align-items-center gap-2 flex-shrink-0">
            {/* Desktop Navigation */}
            <div className="d-none d-md-flex align-items-center gap-2">
              {user ? (
                <ul className="navbar-nav align-items-center gap-1 flex-row mb-0">
                  {/* Cart Icon */}
                  <li className="nav-item">
                    <Link
                      className="nav-link position-relative px-2 mx-1"
                      to="/cart"
                      title="Cart"
                    >
                      <span style={{ fontSize: "20px" }}>🛒</span>
                      {cartCount > 0 && (
                        <span
                          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                          style={{ fontSize: "10px" }}
                        >
                          {cartCount > 99 ? "99+" : cartCount}
                        </span>
                      )}
                    </Link>
                  </li>

                  {/* Wishlist Icon */}
                  <li className="nav-item">
                    <Link
                      className="nav-link position-relative px-2 mx-1"
                      to="/wishlist"
                      title="Wishlist"
                    >
                      <span style={{ fontSize: "20px" }}>❤️</span>
                      {wishlistCount > 0 && (
                        <span
                          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                          style={{ fontSize: "10px" }}
                        >
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                  </li>

                  {/* Orders Icon */}
                  <li className="nav-item">
                    <Link
                      className="nav-link position-relative px-2 mx-1 text-light d-flex align-items-center"
                      to="/orders"
                      title="Orders"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-package align-middle"
                        style={{ marginTop: "-2px" }}
                      >
                        <path d="m7.5 4.27 9 5.15"/>
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                        <path d="m3.3 7 8.7 5 8.7-5"/>
                        <path d="M12 22V12"/>
                      </svg>
                    </Link>
                  </li>

                  {/* User Greeting */}
                  <li className="nav-item">
                    <Link className="nav-link fw-semibold text-light px-2" to="/account">
                      👤 {user.name?.split(" ")[0]}
                    </Link>
                  </li>

                  {/* Seller Dashboard */}
                  {user.role === "seller" && (
                    <li className="nav-item">
                      <Link
                        className="btn btn-outline-warning btn-sm ms-1 text-nowrap"
                        to="/SellerDashboard"
                        style={{ borderRadius: "8px" }}
                      >
                        Dashboard
                      </Link>
                    </li>
                  )}

                  {/* Logout Button */}
                  <li className="nav-item">
                    <button
                      className="btn btn-danger btn-sm ms-1 text-nowrap"
                      onClick={handleLogout}
                      style={{ borderRadius: "8px" }}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <Link className="btn btn-outline-light btn-sm" to="/login" style={{ borderRadius: "8px" }}>
                    Login
                  </Link>
                  <Link className="btn btn-success btn-sm" to="/signup" style={{ borderRadius: "8px" }}>
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Hamburger Menu Toggle Button */}
            <button
              className="btn btn-outline-light border-0 px-2 ms-1"
              style={{ fontSize: "22px" }}
              onClick={() => setIsOpen(true)}
              type="button"
              aria-label="Open Navigation Drawer"
            >
              ☰
            </button>
          </div>

        </div>
      </nav>

      <GroupBuyOffcanvas 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    </>
  );
}

export default Navbar;