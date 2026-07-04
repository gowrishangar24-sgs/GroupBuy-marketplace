import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function ContactUs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [msg, setMsg] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    alert("📩 Support ticket logged successfully! Our workspace queue responds within 24 hours.");
    setMsg("");
  };

  return (
    <>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <div className="container mt-5 mb-5" style={{ minHeight: "65vh" }}>
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow p-4 bg-white text-dark" style={{ borderRadius: "14px" }}>
              <h2 className="fw-bold mb-2">📞 Contact Support</h2>
              <p className="text-muted small mb-4">Have questions? Send us a direct query or email us at: <strong className="text-success">gowrishangarofficialmail@gmail.com</strong></p>
              
              <form onSubmit={handleSend}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-secondary">Your Message</label>
                  <textarea 
                    className="form-control bg-white text-dark custom-input" 
                    rows="5" 
                    placeholder="Describe your question or issue in detail..." 
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-success w-100 py-2 fw-bold text-uppercase">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-input:focus {
          color: #212529 !important;
          background-color: #ffffff !important;
          border-color: #198754 !important;
          box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25) !important;
        }
      `}</style>
      <Footer />
    </>
  );
}

export default ContactUs;