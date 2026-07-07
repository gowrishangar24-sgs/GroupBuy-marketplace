import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import DealCard from "../components/DealCard";
import axios from "axios";

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(query);
  const [activeTab, setActiveTab] = useState("products");

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get("/products"),
      axios.get("/deals"),
    ])
      .then(([prodRes, dealRes]) => {
        if (prodRes.data.success) setProducts(prodRes.data.products);
        if (dealRes.data.success) setDeals(dealRes.data.deals);
      })
      .catch((err) => console.error("Search error:", err))
      .finally(() => setLoading(false));
  }, []);

  const match = (str) =>
    str ? str.toLowerCase().includes(searchTerm.toLowerCase()) : false;

  const filteredProducts = products.filter(
    (p) => match(p.title) || match(p.category) || match(p.seller)
  );
  const filteredDeals = deals.filter(
    (d) => match(d.title) || match(d.category) || match(d.seller)
  );

  const totalFound = filteredProducts.length + filteredDeals.length;

  return (
    <>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="container mt-5 mb-5" style={{ minHeight: "60vh" }}>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 className="fw-bold m-0">🔍 Search Results</h2>
            <p className="text-muted m-0">
              Results for <span className="text-success fw-bold">"{searchTerm || "All"}"</span>
            </p>
          </div>
          <span className="badge bg-dark fs-6 px-3 py-2">{totalFound} found</span>
        </div>

        {/* Tab switcher */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold ${activeTab === "products" ? "active text-dark" : "text-muted"}`}
              onClick={() => setActiveTab("products")}
            >
              🛍️ Products
              {filteredProducts.length > 0 && (
                <span className="badge bg-dark ms-1">{filteredProducts.length}</span>
              )}
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link fw-semibold ${activeTab === "deals" ? "active text-dark" : "text-muted"}`}
              onClick={() => setActiveTab("deals")}
            >
              🔥 Group Deals
              {filteredDeals.length > 0 && (
                <span className="badge bg-success ms-1">{filteredDeals.length}</span>
              )}
            </button>
          </li>
        </ul>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" />
            <p className="mt-2 text-muted">Searching...</p>
          </div>
        ) : activeTab === "products" ? (
          filteredProducts.length === 0 ? (
            <div className="card text-center p-5 border-0 bg-light rounded-3">
              <div className="fs-1">🤷‍♂️</div>
              <h4 className="mt-3 fw-bold">No products found</h4>
              <p className="text-muted">Try a different search term.</p>
              <a href="/" className="btn btn-success mx-auto mt-2 px-4">Back to Home</a>
            </div>
          ) : (
            <div className="row">
              {filteredProducts.map((product) => (
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
        ) : (
          filteredDeals.length === 0 ? (
            <div className="card text-center p-5 border-0 bg-light rounded-3">
              <div className="fs-1">🤷‍♂️</div>
              <h4 className="mt-3 fw-bold">No group deals found</h4>
              <p className="text-muted">Try a different search term.</p>
              <a href="/" className="btn btn-success mx-auto mt-2 px-4">Back to Home</a>
            </div>
          ) : (
            <div className="row">
              {filteredDeals.map((deal) => (
                <div key={deal._id} className="col-xl-3 col-lg-4 col-md-6 mb-4">
                  <DealCard
                    id={deal._id}
                    title={deal.title}
                    image={deal.image}
                    originalPrice={deal.originalPrice}
                    groupPrice={deal.groupPrice}
                    joined={deal.joinedUsers}
                    target={deal.targetMembers}
                    seller={deal.seller}
                    daysLeft={deal.daysLeft}
                  />
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

export default SearchResults;
