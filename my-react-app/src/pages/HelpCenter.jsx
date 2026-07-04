import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <div className="container mt-5 mb-5" style={{ minHeight: "65vh" }}>
        <div className="text-center mb-5 py-4 bg-light rounded-4 border">
          <h1 className="fw-bold text-dark">📖 Help Center</h1>
          <p className="text-muted lead">Find answers, learn about group buying pools, and manage your store</p>
        </div>

        <div className="row g-4 justify-content-center">
          {[
            { title: "📦 Orders & Tracking", desc: "Learn how purchases update, delivery expectations, and order cancellation rules." },
            { title: "💰 Pool Pricing Tiers", desc: "Understand how group buy pricing levels automatically unlock as more shoppers join." },
            { title: "👤 Account Security", desc: "Manage your profile preferences, update emails, and handle password recovery safely." },
            { title: "💼 Seller Workspace", desc: "Guidelines for inventory configuration, campaign launches, and revenue tracking metrics." }
          ].map((topic, i) => (
            <div key={i} className="col-md-6 col-lg-5">
              <div className="card h-100 shadow-sm border-0 p-4 bg-white text-dark" style={{ borderRadius: "12px" }}>
                <h5 className="fw-bold mb-2 text-success">{topic.title}</h5>
                <p className="text-secondary small m-0 style={{ lineHeight: '1.6' }}">{topic.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default HelpCenter;