import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import DealCard from "../../components/DealCard";
import { Link } from "react-router-dom";
import axios from "axios";

function ElectronicsOffer() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: "Electronics & Gadgets", path: "/electronics" },
    { name: "Home & Kitchen", path: "/home-kitchen" },
    { name: "Beauty & Personal Care", path: "/beauty" },
    { name: "Clothing, Shoes & Jewelry", path: "/clothing" },
    { name: "Health & Household", path: "/health" },
    { name: "Sports & Outdoors", path: "/sports" },
    { name: "Toys, Games & Books", path: "/toys-books" }
  ];

  useEffect(() => {
    axios.get("http://localhost:5000/api/deals")
      .then((res) => {
        const allDeals = res.data.deals || res.data || [];
        const filtered = allDeals.filter(d => d.category?.toLowerCase().includes("electronic"));
        setProducts(filtered);
      })
      .catch(err => console.error("Error fetching electronics:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <nav className="navbar navbar-light bg-light border-bottom">
        <div className="container-fluid justify-content-center flex-wrap">
          {categories.map((category, index) => (
            <Link key={index} to={category.path} className="btn btn-sm btn-outline-dark m-1">
              {category.name}
            </Link>
          ))}
        </div>
      </nav>

      <div className="bg-dark text-white p-5 rounded mb-5">
        <h1>Electronics Deals Starting From ₹9999</h1>
        <p>Premium gadgets, laptops, TVs and accessories at group-buy prices.</p>
      </div>

      <div className="container py-5">
        {loading ? (
          <div className="text-center"><div className="spinner-border text-primary" /></div>
        ) : (
          <div className="row">
            {products.length === 0 ? (
              <div className="text-center text-muted">No live electronics group buys running.</div>
            ) : (
              products.map((product) => (
                <div className="col-md-4 mb-4" key={product._id}>
                  <DealCard 
                    id={product._id}
                    title={product.title}
                    image={product.image}
                    originalPrice={product.originalPrice}
                    groupPrice={product.groupPrice}
                    joined={product.joinedUsers || 0}
                    target={product.targetMembers}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default ElectronicsOffer;