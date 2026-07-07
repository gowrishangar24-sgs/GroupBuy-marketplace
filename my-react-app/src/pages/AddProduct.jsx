import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer"; 
import axios from "axios";
import { useNavigate } from "react-router-dom";

const emptyForm = {
  title: "",
  image: "",
  category: "electronics",
  price: "",
  stock: "",
  description: "",
  seller: "",
};

function AddProduct() {
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "/products/create",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Product Added Successfully!");
      setFormData(emptyForm);
      navigate("/SellerDashboard");

    } catch (error) {
      alert(error.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="container mt-5 mb-5">
        <div className="card shadow p-4 bg-white text-dark" style={{ maxWidth: "700px", margin: "0 auto", borderRadius: "12px" }}>

          <h2 className="mb-4 fw-bold text-dark">Add New Product</h2>

          <form onSubmit={handleSubmit}>

            {/* Product Title */}
            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary">Product Title</label>
              <input
                type="text"
                name="title"
                className="form-control custom-add-input"
                value={formData.title}
                onChange={handleChange}
                autoComplete="off"
                spellCheck="false"
                required
              />
            </div>

            {/* Image URL */}
            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary">Image URL</label>
              <input
                type="text"
                name="image"
                className="form-control custom-add-input"
                placeholder="https://..."
                value={formData.image}
                onChange={handleChange}
                autoComplete="off"
                spellCheck="false"
              />
              {formData.image && (
                <img
                  src={formData.image}
                  alt="preview"
                  className="mt-2 rounded border"
                  style={{ height: "100px", width: "100px", objectFit: "cover" }}
                />
              )}
            </div>

            {/* Category Dropdown */}
            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary">Category</label>
              <select
                name="category"
                className="form-select custom-add-input"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="electronics">Electronics</option>
                <option value="home-kitchen">Home & Kitchen</option>
                <option value="beauty">Beauty</option>
                <option value="clothing">Clothing</option>
                <option value="health">Health</option>
                <option value="sports">Sports</option>
                <option value="toys-books">Toys & Books</option>
              </select>
            </div>

            {/* Price & Stock */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-secondary">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  className="form-control custom-add-input"
                  value={formData.price}
                  onChange={handleChange}
                  autoComplete="off"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold text-secondary">Stock Quantity</label>
                <input
                  type="number"
                  name="stock"
                  className="form-control custom-add-input"
                  value={formData.stock}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Seller/Store Input */}
            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary">Seller / Store Name</label>
              <input
                type="text"
                name="seller"
                className="form-control custom-add-input"
                value={formData.seller}
                onChange={handleChange}
                autoComplete="off"
                spellCheck="false"
              />
            </div>

            {/* Description Textarea */}
            <div className="mb-4">
              <label className="form-label fw-semibold text-secondary">Description</label>
              <textarea
                name="description"
                className="form-control custom-add-input no-resize"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                spellCheck="false"
              />
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              className="btn btn-success w-100 py-2 fw-bold text-uppercase tracking-wider"
              disabled={loading}
              style={{ borderRadius: "8px" }}
            >
              {loading ? "Adding..." : "Add Product"}
            </button>

          </form>
        </div>
      </div>

      {/* 🛡️ FORCE INTERCEPT STATE OVERRIDES & RENDER FIXES */}
      {/* 🛡️ FORCE INTERCEPT STATE OVERRIDES & RENDER FIXES */}
      <style>{`
        .custom-add-input {
          color: #212529 !important;
          background-color: #ffffff !important;
        }
        
        /* 💡 THIS FIXES THE INVISIBLE TYPING BUG */
        .custom-add-input:focus,
        .custom-add-input:active {
          color: #212529 !important;
          background-color: #ffffff !important;
          border-color: #198754 !important;
          box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25) !important;
          -webkit-text-fill-color: #212529 !important; /* Fixes browser autofill/focus masking */
        }
        
        .no-resize {
          resize: none !important;
        }
      `}</style>
      <Footer />
    </>
  );
}

export default AddProduct;