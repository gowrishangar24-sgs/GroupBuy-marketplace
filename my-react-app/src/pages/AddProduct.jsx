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
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please choose a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview("");
    setFormData((prev) => ({ ...prev, image: "" }));
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
      setImagePreview("");
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

            {/* Product Image */}
            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary">Product Image</label>

              {/* Hidden file input */}
              <input
                type="file"
                id="product-image-upload"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />

              {!imagePreview ? (
                /* Clickable Upload Card */
                <label
                  htmlFor="product-image-upload"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "124px",
                    height: "124px",
                    border: "1.8px solid #6366f1",
                    borderRadius: "14px",
                    backgroundColor: "#fcfdff",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f0f3ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#fcfdff")
                  }
                >
                  {/* Document + Plus SVG Icon */}
                  <svg
                    width="38"
                    height="38"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="11" x2="12" y2="17" />
                    <line x1="9" y1="14" x2="15" y2="14" />
                  </svg>

                  <span
                    style={{
                      marginTop: "7px",
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#475569",
                    }}
                  >
                    Upload file
                  </span>
                </label>
              ) : (
                /* Uploaded Image Preview */
                <div
                  style={{
                    position: "relative",
                    width: "124px",
                    height: "124px",
                  }}
                >
                  <img
                    src={imagePreview}
                    alt="Uploaded Product"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "14px",
                      border: "1.8px solid #6366f1",
                    }}
                  />
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={removeImage}
                    className="btn btn-sm btn-danger position-absolute"
                    style={{
                      top: "-8px",
                      right: "-8px",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      padding: "0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                    }}
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
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