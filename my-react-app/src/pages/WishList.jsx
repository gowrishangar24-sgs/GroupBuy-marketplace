import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Wishlist() {
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ Added global navigation state tracker

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      alert("Please login to view your wishlist");
      navigate("/login");
      return;
    }
    fetchWishlist();
  }, []);

  const fetchWishlist = () => {
    axios
      .get("http://localhost:5000/api/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.success) {
          setWishlist(res.data.wishlist);
        }
      })
      .catch((err) => console.error("Error fetching wishlist:", err))
      .finally(() => setLoading(false));
  };

  const handleRemoveWishItem = async (productId) => {
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/wishlist/remove/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setWishlist(res.data.wishlist);
        alert("Removed from Wishlist");
      }
    } catch (err) {
      alert("Error removing item from wishlist");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <div className="container py-5 text-center">
          <div className="spinner-border text-danger" />
          <p className="mt-2">Loading your favorites...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="container mt-5 mb-5">
        <h2 className="fw-bold mb-4">❤️ My Wishlist</h2>

        {wishlist.products.length === 0 ? (
          <div className="card text-center p-5 shadow-sm border-0">
            <div className="fs-1 text-danger">🖤</div>
            <h4 className="mt-3 text-muted">Your wishlist is lonely</h4>
            <p className="text-secondary">Save items you like to monitor deal milestones safely.</p>
            <Link to="/" className="btn btn-danger mx-auto mt-2" style={{ maxWidth: "200px" }}>
              Discover items
            </Link>
          </div>
        ) : (
          <div className="row">
            {wishlist.products.map((product) => {
              if (!product) return null;
              return (
                <div key={product._id} className="col-xl-3 col-lg-4 col-md-6 mb-4">
                  <div className="card h-100 border-0 shadow-sm position-relative overflow-hidden" style={{ borderRadius: "15px" }}>
                    <button
                      className="btn btn-light position-absolute border-0 shadow-sm rounded-circle d-flex align-items-center justify-content-center"
                      style={{ top: "12px", right: "12px", width: "35px", height: "35px", zIndex: 10 }}
                      onClick={() => handleRemoveWishItem(product._id)}
                    >
                      ✕
                    </button>

                    <div style={{ height: "200px", overflow: "hidden" }}>
                      <img
                        src={product.image || "/shopping.png"}
                        alt={product.title}
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                      />
                    </div>

                    <div className="card-body d-flex flex-column justify-content-between">
                      <div>
                        <span className="badge bg-secondary mb-2">{product.category}</span>
                        <h5 className="fw-bold text-dark text-truncate mb-1">{product.title}</h5>
                        <p className="text-muted small mb-2">Seller: {product.seller || "Verified Store"}</p>
                        <h4 className="text-success fw-bold">₹{product.price}</h4>
                      </div>

                      <div className="mt-3 d-flex flex-column gap-2">
                        <Link to={`/product/${product._id}`} className="btn btn-dark w-100 btn-sm">
                          View Details / Deals
                        </Link>
                        <button 
                          className="btn btn-outline-danger w-100 btn-sm"
                          onClick={() => handleRemoveWishItem(product._id)}
                        >
                          Remove Item
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

export default Wishlist;