import Navbar from "../components/Navbar";
import CategoryCard from "../components/CategoryCard";
import CategoryNavbar from "../components/CategoryNavbar";
import Footer from "../components/Footer";
import DealCard from "../components/DealCard";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function Home() {
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingDeals, setLoadingDeals] = useState(true);

  // Dynamically uses your live Render URL in production, defaults to local host during development
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    // ✅ Clean & Relative: axios automatically prepends the baseURL + /api from App.jsx
    Promise.all([
      axios.get("/deals"),
      axios.get("/products"),
    ])
      .then(([dealRes, prodRes]) => {
        if (dealRes.data.success && Array.isArray(dealRes.data.deals)) {
          setDeals(dealRes.data.deals);
        }
        if (prodRes.data.success && Array.isArray(prodRes.data.products)) {
          setProducts(prodRes.data.products);
        }
      })
      .catch((err) => console.error("Database fetch failed on deployment sequence:", err))
      .finally(() => setLoadingDeals(false));
  }, []); 
  
  // ⚡ Dependency array is now empty because we don't rely on tracking API_BASE_URL anymore
  const activeDealsOnly = deals.filter((d) => d && d.status === "active" && d.title);

  const endingSoonDeals = [...activeDealsOnly]
    .sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0))
    .slice(0, 3);

  const popularDeals = [...activeDealsOnly]
    .sort((a, b) => (b.joinedUsers ?? 0) - (a.joinedUsers ?? 0))
    .slice(0, 3);

  const filteredDeals = activeDealsOnly.filter((d) =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredProducts = products.filter((p) =>
    p && p.title && p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoryCards = [
    {
      title: "Top Electronics | Up to 55% off",
      items: [
        { image: "/earph.jpg", label: "Headphones" },
        { image: "/smartw.jpg", label: "Smart Watch" },
        { image: "/key.jpg", label: "Keyboard" },
        { image: "/mouse.avif", label: "Mouse" },
      ],
    },
    {
      title: "Upgrade your kitchen | Up to 50% off",
      items: [
        { image: "/cookware.jpg", label: "Cookware" },
        { image: "/mixer.jpg", label: "Mixer" },
        { image: "/store.jpg", label: "Storage" },
        { image: "/furniture.jpg", label: "Furniture" },
      ],
    },
    {
      title: "Fashion picks | Up to 70% off",
      items: [
        { image: "/shoe.jpg", label: "Shoes" },
        { image: "/dumbells.jpg", label: "Dumbbells" },
        { image: "/bicyle.jpg", label: "Bicycle" },
        { image: "/football.jpg", label: "Football" },
      ],
    },
  ];

  const DealRow = ({ list, emptyMsg }) =>
    list.length === 0 ? (
      <div className="text-center py-5 bg-light rounded-3 border border-dashed">
        <p className="text-muted m-0 fw-medium">{emptyMsg}</p>
      </div>
    ) : (
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {list.map((deal) => (
          <div key={deal._id} className="col">
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
    );

  return (
    <>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <CategoryNavbar />

      {/* OFFER CAROUSEL */}
      <div
        id="offerCarousel"
        className="carousel slide mb-4"
        data-bs-ride="carousel"
        data-bs-interval="3000"
      >
        <div className="carousel-inner">
          <div className="carousel-item active">
            <div className="container">
              <div className="row g-3">
                <div className="col-6">
                  <Link to="/offers/ElectronicsOffer">
                    <img src="/C1.png" className="w-100 rounded shadow-sm" alt="" style={{ height: "280px", objectFit: "cover" }} />
                  </Link>
                </div>
                <div className="col-6">
                  <Link to="/offers/BeautyOffer">
                    <img src="/c2.png" className="w-100 rounded shadow-sm" alt="" style={{ height: "280px", objectFit: "cover" }} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="carousel-item">
            <div className="container">
              <div className="row g-3">
                <div className="col-6">
                  <Link to="/offers/KitchenOffer">
                    <img src="/c5.png" className="w-100 rounded shadow-sm" alt="" style={{ height: "280px", objectFit: "cover" }} />
                  </Link>
                </div>
                <div className="col-6">
                  <Link to="/offers/FashionOffer">
                    <img src="/c3.png" className="w-100 rounded shadow-sm" alt="" style={{ height: "280px", objectFit: "cover" }} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="carousel-item">
            <div className="container">
              <div className="row g-3">
                <div className="col-6">
                  <Link to="/offers/SportsOffer">
                    <img src="/c4.png" className="w-100 rounded shadow-sm" alt="" style={{ height: "280px", objectFit: "cover" }} />
                  </Link>
                </div>
                <div className="col-6">
                  <Link to="/offers/BoatOffer">
                    <img src="/boat.png" className="w-100 rounded shadow-sm" alt="" style={{ height: "280px", objectFit: "cover" }} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#offerCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" />
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#offerCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" />
        </button>
      </div>

      <div className="container mt-4">

        {/* HERO */}
        <div className="text-center mb-5 py-4">
          <h1 className="display-4 fw-bold">Buy Together, Save More</h1>
          <p className="lead text-muted">Join group purchases and unlock exclusive discounts.</p>
          
          {/* FIX: Standardized into a clean responsive flexbox structure */}
          <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center align-items-center mt-4 px-3 mx-auto" style={{ maxWidth: "480px" }}>
            <Link 
              to="/electronics" 
              className="btn btn-dark btn-lg w-100 w-sm-auto px-4 py-2" 
              style={{ borderRadius: "8px", fontSize: "16px", fontWeight: "500" }}
            >
              Explore Categories
            </Link>
            <Link 
              to="/search?q=" 
              className="btn btn-outline-success btn-lg w-100 w-sm-auto px-4 py-2" 
              style={{ borderRadius: "8px", fontSize: "16px", fontWeight: "500" }}
            >
              Browse All Deals
            </Link>
          </div>
        </div>

        {/* CATEGORY CARDS */}
        <div className="row mb-5">
          {categoryCards.map((cat, i) => (
            <div key={i} className="col-lg-4 col-md-6 mb-4 d-flex justify-content-center">
              <CategoryCard title={cat.title} items={cat.items} linkText="Explore Deals" />
            </div>
          ))}
        </div>

        <hr className="my-5 opacity-25" />

        {/* LATEST PRODUCTS */}
        {filteredProducts.length > 0 && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold text-dark mb-0">🛍️ Latest Products</h2>
              <Link to="/electronics" className="btn btn-sm btn-outline-dark">View All →</Link>
            </div>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4">
              {filteredProducts.slice(0, 8).map((product) => (
                <div key={product._id} className="col">
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
            <hr className="my-5 opacity-25" />
          </>
        )}

        {/* TRENDING GROUP DEALS */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-dark mb-0">🔥 Trending Group Deals</h2>
          <Link to="/search?q=" className="btn btn-sm btn-outline-success">View All →</Link>
        </div>
        {loadingDeals ? (
          <div className="text-center py-5"><div className="spinner-border text-success" /></div>
        ) : (
          <DealRow
            list={filteredDeals.slice(0, 6)}
            emptyMsg={searchTerm ? `No deals match "${searchTerm}"` : "No active deals yet. Check back soon!"}
          />
        )}

        {/* MOST POPULAR */}
        {popularDeals.length > 0 && (
          <>
            <h2 className="mb-4 mt-5 fw-bold text-dark">👥 Most Popular Deals</h2>
            <DealRow list={popularDeals} emptyMsg="No popular deals yet." />
          </>
        )}

        {/* DEALS ENDING SOON */}
        {endingSoonDeals.length > 0 && (
          <>
            <h2 className="mb-4 mt-5 fw-bold text-dark">⏰ Deals Ending Soon</h2>
            <DealRow list={endingSoonDeals} emptyMsg="No deals approaching their deadline right now." />
          </>
        )}

        {/* WHY GROUPBUY */}
        <div className="bg-dark text-white p-5 rounded-4 mt-5 mb-5 shadow-sm">
          <h2 className="text-center mb-5 fw-bold">Why Choose GroupBuy?</h2>
          <div className="row text-center">
            <div className="col-md-4 mb-3">
              <div className="fs-1 mb-2">💰</div>
              <h4 className="fw-bold text-success">Save More</h4>
              <p className="text-secondary">Unlock major discounts through group orders.</p>
            </div>
            <div className="col-md-4 mb-3">
              <div className="fs-1 mb-2">🤝</div>
              <h4 className="fw-bold text-info">Buy Together</h4>
              <p className="text-secondary">Team up with buyers to hit deal thresholds fast.</p>
            </div>
            <div className="col-md-4 mb-3">
              <div className="fs-1 mb-2">🚚</div>
              <h4 className="fw-bold text-warning">Trusted Sellers</h4>
              <p className="text-secondary">Every seller undergoes strict verification.</p>
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </>
  );
}

export default Home;