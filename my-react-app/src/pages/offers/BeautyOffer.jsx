import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import DealCard from "../../components/DealCard";
import axios from "axios";

function BeautyOffer() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/deals")
      .then((res) => {
        const allDeals = res.data.deals || res.data || [];
        // Filter live deals that contain "beauty" in the category string
        const filtered = allDeals.filter(d => d.category?.toLowerCase().includes("beauty"));
        setProducts(filtered);
      })
      .catch(err => console.error("Error fetching Beauty deals:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="bg-danger text-white p-5">
        <h1>💄 Beauty Products - Up to 50% OFF</h1>
        <p>Premium skincare and makeup at amazing discounts.</p>
      </div>

      <div className="container py-5">
        {loading ? (
          <div className="text-center"><div className="spinner-border text-danger" /></div>
        ) : (
          <div className="row">
            {products.length === 0 ? (
              <div className="text-center text-muted">No live beauty group buys available right now.</div>
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

export default BeautyOffer;