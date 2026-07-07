/**
 * CategoryPage.jsx
 * 
 * A single reusable component that powers ALL 7 category pages.
 * Replaces the 7 near-identical category pages (Electronics, Beauty, etc.)
 * with one component that accepts config props.
 * 
 * Usage in App.jsx:
 *   <Route path="/electronics" element={
 *     <CategoryPage
 *       categoryKey="electronics"
 *       label="Electronics & Gadgets"
 *       emoji="💻"
 *       gradient="linear-gradient(135deg,#0f172a,#1e293b,#0f172a)"
 *       description="Group deals on headphones, smartwatches, keyboards, and more."
 *       dealEmoji="🔥"
 *     />
 *   } />
 */

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import CategoryNavbar from "../components/CategoryNavbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import DealCard from "../components/DealCard";
import axios from "axios";

function CategoryPage({ categoryKey, label, emoji, gradient, description, dealEmoji = "🤝" }) {
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("products");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get("/products", { params: { category: categoryKey } }),
      axios.get("/deals",    { params: { category: categoryKey } }),
    ])
      .then(([prodRes, dealRes]) => {
        if (prodRes.data.success) setProducts(prodRes.data.products);
        if (dealRes.data.success) setDeals(dealRes.data.deals);
      })
      .catch((err) => console.error(`Error fetching ${categoryKey}:`, err))
      .finally(() => setLoading(false));
  }, [categoryKey]);

  // Client-side filter by search
  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.seller?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDeals = deals.filter((d) =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.seller?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc")  return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "name")       return a.title.localeCompare(b.title);
    return 0; // newest (default from API)
  });

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    if (sortBy === "ending")     return (a.daysLeft ?? 0) - (b.daysLeft ?? 0);
    if (sortBy === "popular")    return (b.joinedUsers ?? 0) - (a.joinedUsers ?? 0);
    return 0;
  });

  return (
    <>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <CategoryNavbar />

      {/* Hero Banner */}
      <div className="text-white text-center py-5" style={{ background: gradient }}>
        <div className="container">
          <div style={{ fontSize: "48px" }}>{emoji}</div>
          <h1 className="display-5 fw-bold mt-2">{label}</h1>
          <p className="lead text-light opacity-75">{description}</p>
          <div className="d-flex justify-content-center gap-3 mt-3 flex-wrap">
            <span className="badge bg-white text-dark px-3 py-2 fs-6">
              📦 {products.length} Products
            </span>
            <span className="badge bg-success px-3 py-2 fs-6">
              🤝 {deals.length} Group Deals
            </span>
          </div>
        </div>
      </div>

      <div className="container py-4">

        {/* Tab + Sort Controls */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <ul className="nav nav-tabs border-0 mb-0">
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold ${activeTab === "products" ? "active text-dark" : "text-muted"}`}
                onClick={() => { setActiveTab("products"); setSortBy("newest"); }}
              >
                🛍️ Products
                {products.length > 0 && <span className="badge bg-dark ms-1">{products.length}</span>}
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold ${activeTab === "deals" ? "active text-dark" : "text-muted"}`}
                onClick={() => { setActiveTab("deals"); setSortBy("newest"); }}
              >
                {dealEmoji} Group Deals
                {deals.length > 0 && <span className="badge bg-success ms-1">{deals.length}</span>}
              </button>
            </li>
          </ul>

          {/* Sort dropdown */}
          <select
            className="form-select form-select-sm w-auto"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {activeTab === "products" ? (
              <>
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="name">Name A–Z</option>
              </>
            ) : (
              <>
                <option value="newest">Newest First</option>
                <option value="ending">Ending Soon</option>
                <option value="popular">Most Joined</option>
              </>
            )}
          </select>
        </div>

        {/* Inline search (filters the tab results instantly) */}
        <div className="mb-4">
          <input
            type="text"
            className="form-control"
            placeholder={`Filter ${label} by name or seller...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: "380px" }}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" style={{ width: "3rem", height: "3rem" }} />
            <p className="mt-3 text-muted">Loading {label}...</p>
          </div>
        ) : activeTab === "products" ? (
          sortedProducts.length === 0 ? (
            <Empty message={`No ${label} products found.`} searchTerm={searchTerm} />
          ) : (
            <div className="row">
              {sortedProducts.map((product) => (
                <div key={product._id} className="col-xl-3 col-lg-4 col-md-6 mb-4">
                  <ProductCard
                    id={product._id}
                    title={product.title}
                    image={product.image}
                    price={product.price}
                    category={product.category}
                    seller={product.seller}
                    stock={product.stock}
                  />
                </div>
              ))}
            </div>
          )
        ) : sortedDeals.length === 0 ? (
          <Empty message={`No group deals for ${label} yet.`} searchTerm={searchTerm} />
        ) : (
          <div className="row">
            {sortedDeals.map((deal) => (
              <div key={deal._id} className="col-xl-3 col-lg-4 col-md-6 mb-4">
                {/* ✅ FIX: pass tiers + activeTierPrice instead of groupPrice */}
                <DealCard
                  id={deal._id}
                  title={deal.title}
                  image={deal.image}
                  originalPrice={deal.originalPrice}
                  tiers={deal.tiers}
                  activeTierPrice={deal.activeTierPrice}
                  joined={deal.joinedUsers}
                  target={deal.targetMembers}
                  seller={deal.seller}
                  daysLeft={deal.daysLeft}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

function Empty({ message, searchTerm }) {
  return (
    <div className="text-center py-5 bg-light rounded-3 p-4">
      <div className="fs-1 mb-3">🔍</div>
      <p className="text-muted fs-5 mb-2">{message}</p>
      {searchTerm && (
        <p className="text-secondary small">No results for "{searchTerm}" — try clearing the filter.</p>
      )}
    </div>
  );
}

export default CategoryPage;
