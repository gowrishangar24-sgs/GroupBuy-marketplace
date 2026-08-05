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
      <nav className="navbar navbar-dark bg-black sticky-top shadow-sm p-0">
        <div className="w-100">
          {/* Main Top Navbar Row */}
          <div className="container-fluid px-3 py-2 d-flex align-items-center justify-content-between">
            
            {/* Left: Brand Logo */}
            <Link className="navbar-brand fw-bold me-auto me-md-3" to="/">
              <img src="/title.png" alt="GroupBuy" style={{ height: "clamp(30px, 4.5vw, 42px)", objectFit: "contain" }} />
            </Link>

            {/* Desktop Right Side Navigation Actions */}
            <div className="d-none d-md-flex align-items-center gap-2">
              {user ? (
                <ul className="navbar-nav align-items-center gap-1 flex-row">
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

            {/* Right: Hamburger Menu Toggle Button */}
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

          {/* Search Bar Row (Below main top navbar header) */}
          <div className="px-3 pb-2 pt-1 bg-black border-top border-secondary border-opacity-25">
            <form
              className="d-flex mx-auto"
              style={{ maxWidth: "600px" }}
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