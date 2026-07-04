import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import CategoryNavbar from "../components/CategoryNavbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import DealCard from "../components/DealCard";
import axios from "axios";

// FIX: category value must match Product model enum exactly: "Home & Kitchen"
// FIX: do NOT pre-encode the & — axios encodes it automatically
const CATEGORY = "Home & Kitchen";

function HomeKitchen() {
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("products");

  useEffect(() => {
    Promise.all([
      axios.get("http://localhost:5000/api/products", { params: { category: CATEGORY } }),
      axios.get("http://localhost:5000/api/deals",   { params: { category: CATEGORY } }),
    ])
      .then(([prodRes, dealRes]) => {
        if (prodRes.data.success) setProducts(prodRes.data.products);
        if (dealRes.data.success) setDeals(dealRes.data.deals);
      })
      .catch((err) => console.error("Error fetching home & kitchen:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredDeals = deals.filter((d) =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <CategoryNavbar />

      <div className="text-white text-center py-5" style={{ background: "linear-gradient(135deg,#78350f,#92400e,#78350f)" }}>
        <div className="container">
          <h1 className="display-4 fw-bold">Home & Kitchen</h1>
          <p className="lead text-light">Pool orders on cookware, furniture, and storage.</p>
          <div className="d-flex justify-content-center gap-3 mt-3">
            <span className="badge bg-light text-dark px-3 py-2">{products.length} Products</span>
            <span className="badge bg-success px-3 py-2">{deals.length} Group Deals</span>
          </div>
        </div>
      </div>

      <div className="container py-4">
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button className={`nav-link fw-semibold ${activeTab === "products" ? "active text-dark" : "text-muted"}`} onClick={() => setActiveTab("products")}>
              🛍️ Products {products.length > 0 && <span className="badge bg-dark ms-1">{products.length}</span>}
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link fw-semibold ${activeTab === "deals" ? "active text-dark" : "text-muted"}`} onClick={() => setActiveTab("deals")}>
              🏠 Group Deals {deals.length > 0 && <span className="badge bg-success ms-1">{deals.length}</span>}
            </button>
          </li>
        </ul>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-secondary" /></div>
        ) : activeTab === "products" ? (
          filteredProducts.length === 0 ? (
            <div className="text-center py-5 bg-light rounded p-4"><p className="text-muted m-0">No Home & Kitchen products found.</p></div>
          ) : (
            <div className="row">
              {filteredProducts.map((product) => (
                <div key={product._id} className="col-xl-3 col-lg-4 col-md-6 mb-4">
                  <ProductCard id={product._id} title={product.title} image={product.image} price={product.price} category={product.category} seller={product.seller} stock={product.stock} />
                </div>
              ))}
            </div>
          )
        ) : (
          filteredDeals.length === 0 ? (
            <div className="text-center py-5 bg-light rounded p-4"><p className="text-muted m-0">No group deals for Home & Kitchen.</p></div>
          ) : (
            <div className="row">
              {filteredDeals.map((deal) => (
                <div key={deal._id} className="col-xl-3 col-lg-4 col-md-6 mb-4">
                  <DealCard id={deal._id} title={deal.title} image={deal.image} originalPrice={deal.originalPrice} groupPrice={deal.groupPrice} joined={deal.joinedUsers} target={deal.targetMembers} seller={deal.seller} daysLeft={deal.daysLeft} />
                </div>
              ))}
            </div>
          )
        )}
      </div>
      <Footer />
    </>
  );
}

export default HomeKitchen;
