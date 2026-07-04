import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function FAQs() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <div className="container mt-5 mb-5" style={{ minHeight: "65vh", maxWidth: "800px" }}>
        <h2 className="fw-bold text-center mb-2">💡 Frequently Asked Questions</h2>
        <p className="text-muted text-center mb-4">Quick solutions to help you understand how the marketplace behaves</p>

        <div className="accordion shadow-sm" id="faqAccordion" style={{ borderRadius: "12px", overflow: "hidden" }}>
          {[
            { q: "How does group buying work exactly?", a: "Sellers list bulk products with dynamic volume targets. As more buyers register orders before the deadline passes, cheaper pool prices unlock dynamically for every participant!" },
            { q: "What happens if a group campaign fails to meet its target sizing?", a: "If the deal clock expires before the target members threshold is hit, the campaign status falls back to 'cancelled'. Reserved item stock counts automatically return to the seller catalog safely." },
            { q: "When do I pay for my ordered products?", a: "For maximum convenience, all transactions currently settle upon arrival using Cash on Delivery (COD) mode protocols once delivery transit cycles complete." }
          ].map((item, index) => (
            <div className="accordion-item text-dark bg-white" key={index}>
              <h2 className="accordion-header">
                <button 
                  className="accordion-button collapsed fw-semibold text-dark bg-white" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target={`#collapse${index}`}
                >
                  {item.q}
                </button>
              </h2>
              <div id={`collapse${index}`} className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div className="accordion-body text-secondary small" style={{ lineHeight: "1.6" }}>
                  {item.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default FAQs;