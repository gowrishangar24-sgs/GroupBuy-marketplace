import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import DealCard from "../../components/DealCard";
import axios from "axios";

function FashionOffer() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/deals")
      .then((res) => {
        const allDeals = res.data.deals || res.data || [];
        const filtered = allDeals.filter(d => 
          d.category?.toLowerCase().includes("clothing") || 
          d.category?.toLowerCase().includes("fashion")
        );
        setProducts(filtered);
      })
      .catch(err => console.error("Error fetching fashion deals:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="bg-info text-white p-5">
        <h1>👕 Fashion Sale</h1>
        <p>50% OFF + Buy 2 Get Extra 30% OFF</p>
      </div>

      <div className="container py-5">
        {loading ? (
          <div className="text-center"><div className="spinner-border text-info" /></div>
        ) : (
          <div className="row">
            {products.length === 0 ? (
              <div className="text-center text-muted">No live fashion items available.</div>
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

export default FashionOffer;