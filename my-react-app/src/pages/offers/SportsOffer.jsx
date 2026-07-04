import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import DealCard from "../../components/DealCard";
import axios from "axios";

function SportsOffer() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/deals")
      .then((res) => {
        const allDeals = res.data.deals || res.data || [];
        const filtered = allDeals.filter(d => d.category?.toLowerCase().includes("sport") || d.category?.toLowerCase().includes("outdoor"));
        setProducts(filtered);
      })
      .catch(err => console.error("Error fetching sports deals:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="bg-success text-white p-5">
        <h1>⚽ Sports & Fitness Gear</h1>
        <p>Get active together and score deep group buy discounts.</p>
      </div>

      <div className="container py-5">
        {loading ? (
          <div className="text-center"><div className="spinner-border text-success" /></div>
        ) : (
          <div className="row">
            {products.length === 0 ? (
              <div className="text-center text-muted">No live sports gear available right now.</div>
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

export default SportsOffer;