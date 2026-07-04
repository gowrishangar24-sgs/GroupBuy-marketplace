import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import DealCard from "../../components/DealCard";
import axios from "axios";

function KitchenOffer() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/deals")
      .then((res) => {
        const allDeals = res.data.deals || res.data || [];
        const filtered = allDeals.filter(d => d.category?.toLowerCase().includes("kitchen") || d.category?.toLowerCase().includes("home"));
        setProducts(filtered);
      })
      .catch(err => console.error("Error fetching kitchen deals:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="bg-warning p-5">
        <h1>🍳 Kitchen Essentials Up To 40% OFF</h1>
        <p>Cookware, appliances and storage solutions.</p>
      </div>

      <div className="container py-5">
        {loading ? (
          <div className="text-center"><div className="spinner-border text-warning" /></div>
        ) : (
          <div className="row">
            {products.length === 0 ? (
              <div className="text-center text-muted">No live kitchen deals available.</div>
            ) : (
              products.map(product => (
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

export default KitchenOffer;