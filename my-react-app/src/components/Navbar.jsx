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

  // Dynamically uses your live Render URL in production, defaults to local host during development
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

  // Fetch cart + wishlist counts on mount (if logged in)
  useEffect(() => {
    if (!user || !token) return;

    axios
      .get(`${API_BASE_URL}/cart`, {
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
      .get(`${API_BASE_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.success) {
          const items = res.data.wishlist?.products || [];
          setWishlistCount(items.length);
        }
      })
      .catch(() => {});
  }, [API_BASE_URL]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-black sticky-top shadow-sm">
        {/* Added 'flex-nowrap' to force all elements to stay strictly on one horizontal row on mobile */}
        <div className="container-fluid px-3 flex-nowrap justify-content-between align-items-center">
          
          {/* Left: Menu Side Trigger Button */}
          <button
            className="btn btn-outline-light me-1 border-0 px-2"
            style={{ fontSize: "20px" }}
            onClick={() => setIsOpen(true)}
            type="button"
          >
            ☰
          </button>

          {/* Center-Left: Brand Logo (Slightly responsive height max for clean display) */}
          <Link className="navbar-brand fw-bold me-auto ms-1" to="/">
            <img src="/title.png" alt="GroupBuy" style={{ height: "clamp(30px, 4.5vw, 42px)", objectFit: "contain" }} />
          </Link>

          {/* Right: Mobile Collapse Toggle Button */}
          <button
            className="navbar-toggler border-0 px-2 ms-2"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarMain"
            aria-controls="navbarMain"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          {/* Collapsible content (Search + Actions) */}
          <div className="collapse navbar-collapse" id="navbarMain">
            {/* Search Bar */}
            <form
              className="d-flex mx-auto my-2 my-lg-0"
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
            <ul className="navbar-nav ms-auto align-items-center gap-1 w-100 justify-content-end flex-row flex-wrap mt-2 mt-lg-0">
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
                        className="btn btn-outline-warning btn-sm ms-1 my-1"
                        to="/SellerDashboard"
                        style={{ borderRadius: "8px" }}
                      >
                        Dashboard
                      </Link>
                    </li>
                  )}

                  <li className="nav-item">
                    <button
                      className="btn btn-danger btn-sm ms-1 my-1"
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
                    <Link className="btn btn-outline-light btn-sm me-1 my-1" to="/login" style={{ borderRadius: "8px" }}>
                      Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="btn btn-success btn-sm my-1" to="/signup" style={{ borderRadius: "8px" }}>
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <GroupBuyOffcanvas isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

export default Navbar;