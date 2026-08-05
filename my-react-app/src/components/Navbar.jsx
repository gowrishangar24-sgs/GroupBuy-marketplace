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

  // Fetch cart + wishlist counts on mount (if logged in)
  useEffect(() => {
    if (!user || !token) return;

    // ✅ Clean & Relative: axios automatically prepends the baseURL from App.jsx
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
      <nav className="navbar navbar-dark bg-black sticky-top shadow-sm">
        <div className="container-fluid px-3 d-flex align-items-center justify-content-between">
          
          {/* Left: Brand Logo */}
          <Link className="navbar-brand fw-bold me-auto me-md-3" to="/">
            <img src="/title.png" alt="GroupBuy" style={{ height: "clamp(30px, 4.5vw, 42px)", objectFit: "contain" }} />
          </Link>

          {/* Center/Right Desktop Top Bar Content (Hidden on Mobile < 768px) */}
          <div className="d-none d-md-flex align-items-center flex-grow-1 justify-content-between gap-3">
            {/* Search Bar */}
            <form
              className="d-flex mx-auto"
              style={{ width: "min(520px, 100%)" }}
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
                  style={{ borderRadius: "8px 0 0 8px" }}
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

            {/* Right Side Navigation Actions */}
            <ul className="navbar-nav ms-auto align-items-center gap-1 flex-row">
              {user ? (
                <>
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

                  {/* User Greeting */}
                  <li className="nav-item">
                    <Link className="nav-link fw-semibold text-light px-2" to="/account">
                      👤 {user.name?.split(" ")[0]}
                    </Link>
                  </li>

                  {user.role === "seller" && (
                    <li className="nav-item">
                      <Link
                        className="btn btn-outline-warning btn-sm ms-1"
                        to="/SellerDashboard"
                        style={{ borderRadius: "8px" }}
                      >
                        Dashboard
                      </Link>
                    </li>
                  )}

                  <li className="nav-item">
                    <button
                      className="btn btn-danger btn-sm ms-1"
                      onClick={handleLogout}
                      style={{ borderRadius: "8px" }}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="btn btn-outline-light btn-sm me-1" to="/login" style={{ borderRadius: "8px" }}>
                      Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="btn btn-success btn-sm" to="/signup" style={{ borderRadius: "8px" }}>
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Right: Single Hamburger Menu Toggle Button */}
          <button
            className="btn btn-outline-light border-0 px-2 ms-2"
            style={{ fontSize: "22px" }}
            onClick={() => setIsOpen(true)}
            type="button"
            aria-label="Open Navigation Drawer"
          >
            ☰
          </button>
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