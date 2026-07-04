import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light pt-5 pb-3 mt-5 w-100">
      <div className="container-fluid px-5">
        <div className="row justify-content-between">
          
          {/* Brand Column */}
          <div className="col-lg-4 mb-4">
            <h4 className="fw-bold text-white mb-3">GroupBuy</h4>
            <p className="text-secondary small" style={{ lineHeight: "1.6" }}>
              Join forces with other shoppers, unlock exclusive bulk discounts, 
              and save more together directly from verified wholesale factories.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="col-md-3 col-6 mb-4">
            <h6 className="text-uppercase fw-bold text-secondary small mb-3">Marketplace</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-secondary text-decoration-none small hover-white">Browse Deals</Link>
              </li>
              <li className="mb-2">
                <Link to="/electronics" className="text-secondary text-decoration-none small hover-white">Categories</Link>
              </li>
              <li className="mb-2">
                <Link to="/wishlist" className="text-secondary text-decoration-none small hover-white">My Favorites</Link>
              </li>
            </ul>
          </div>

          {/* Seller Tools Column */}
          <div className="col-md-3 col-6 mb-4">
            <h6 className="text-uppercase fw-bold text-secondary small mb-3">Seller Center</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/SellerDashboard" className="text-secondary text-decoration-none small hover-white">Dashboard</Link>
              </li>
              <li className="mb-2">
                <Link to="/AddProduct" className="text-secondary text-decoration-none small hover-white">Add Product</Link>
              </li>
              <li className="mb-2">
                <Link to="/CreateDeal" className="text-secondary text-decoration-none small hover-white">Launch Campaign</Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="col-md-2 col-6 mb-4">
            <h6 className="text-uppercase fw-bold text-secondary small mb-3">Support</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/help-center" className="text-secondary text-decoration-none small hover-white">Help Center</Link>
              </li>
              <li className="mb-2">
                <Link to="/contact-us" className="text-secondary text-decoration-none small hover-white">Contact Us</Link>
              </li>
              <li className="mb-2">
                <Link Mackenzie to="/faqs" className="text-secondary text-decoration-none small hover-white">FAQs</Link>
              </li>
            </ul>
          </div>

        </div>

        <hr className="border-secondary my-4 opacity-25" />

        {/* Bottom Metadata Bar */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center pt-2">
          <p className="text-secondary small mb-2 mb-md-0">
            © {currentYear} GroupBuy Marketplace. All Rights Reserved.
          </p>
          
        </div>

      </div>

      <style>{`
        .hover-white:hover { color: #ffffff !important; transition: color 0.2s ease-in-out; }
      `}</style>
    </footer>
  );
}

export default Footer;