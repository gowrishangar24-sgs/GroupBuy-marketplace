import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import DealCard from "../../components/DealCard";
import axios from "axios";

function BoatOffer() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/deals")
      .then((res) => {
        const allDeals = res.data.deals || res.data || [];
        // Filter deals where the title specifically contains "boat"
        const filtered = allDeals.filter(d => d.title?.toLowerCase().includes("boat"));
        setProducts(filtered);
      })
      .catch(err => console.error("Error fetching boat deals:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="bg-dark text-white p-5">
        <h1>🎧 Boat Airpods Mega Deal</h1>
        <p>Premium wireless earbuds at group-buy prices.</p>
      </div>

      <div className="container py-5">
        {loading ? (
          <div className="text-center"><div className="spinner-border text-dark" /></div>
        ) : (
          <div className="row">
            {products.length === 0 ? (
              <div className="text-center text-muted">No live boAt deals available right now.</div>
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

export default BoatOffer;