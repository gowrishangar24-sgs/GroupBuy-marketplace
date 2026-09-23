import Navbar from "../components/Navbar";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Default empty tier row
const emptyTier = () => ({ minUsers: "", price: "" });

const emptyForm = {
  title: "",
  image: "",
  description: "",
  category: "electronics",
  originalPrice: "",
  seller: "",
  deadline: "",
};

function CreateDeal() {
  const [formData, setFormData] = useState(emptyForm);
  const [tiers, setTiers] = useState([emptyTier()]);
  const [imagePreview, setImagePreview] = useState("");
  const navigate = useNavigate();

  // ── Minimum deadline date: tomorrow ──────────────────────────
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDeadline = tomorrow.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── Image Upload & Preview Handler ───────────────────────────
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optional: Max 5MB check
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

  // ── Tier row handlers ─────────────────────────────────────────
  const handleTierChange = (index, field, value) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], [field]: value };
    setTiers(updated);
  };

  const addTier = () => setTiers([...tiers, emptyTier()]);

  const removeTier = (index) => {
    if (tiers.length === 1) return; // keep at least one tier
    setTiers(tiers.filter((_, i) => i !== index));
  };

  // ── Submission ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Client-side validation ───────────────────────────────
    const original = Number(formData.originalPrice);

    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i];
      if (!t.minUsers || Number(t.minUsers) < 1) {
        alert(`Tier ${i + 1}: minUsers must be at least 1`);
        return;
      }
      if (!t.price || Number(t.price) < 0) {
        alert(`Tier ${i + 1}: price must be a positive number`);
        return;
      }
      if (Number(t.price) >= original) {
        alert(
          `Tier ${i + 1}: group price (₹${t.price}) must be below the original price (₹${original})`
        );
        return;
      }
    }

    if (!formData.deadline) {
      alert("Please set a deal deadline");
      return;
    }

    if (new Date(formData.deadline) <= new Date()) {
      alert("Deadline must be a future date");
      return;
    }

    // Convert tier strings to numbers before sending
    const parsedTiers = tiers.map((t) => ({
      minUsers: Number(t.minUsers),
      price: Number(t.price),
    }));

    // Auto-compute targetMembers from the highest tier requirement
    const computedTargetMembers = tiers && tiers.length > 0
      ? Math.max(...tiers.map((t) => Number(t.minUsers || t.targetMinBuyers) || 0))
      : 1;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/deals/create",
        { ...formData, targetMembers: computedTargetMembers, tiers: parsedTiers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(res.data);
      alert("Deal Created Successfully!");
      setFormData(emptyForm);
      setImagePreview("");
      setTiers([emptyTier()]);
      navigate("/MyDeals");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error Creating Deal");
    }
  };

  return (
    <>
      <Navbar />

      <div className="container mt-5 mb-5">
        <div
          className="card shadow p-4"
          style={{ maxWidth: "640px", margin: "0 auto" }}
        >
          <h2 className="mb-4 fw-bold">🚀 Create a New Deal</h2>

          <form onSubmit={handleSubmit}>
            {/* 1. Deal Title */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Deal Title</label>
              <input
                type="text"
                name="title"
                className="form-control"
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* 2. Upload Product Image Box */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Product Image</label>

              {/* Hidden file input */}
              <input
                type="file"
                id="deal-image-upload"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />

              {!imagePreview ? (
                /* Clickable Upload Card */
                <label
                  htmlFor="deal-image-upload"
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

            {/* 3. Category */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Category</label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="electronics">Electronics & Gadgets</option>
                <option value="home-kitchen">Home & Kitchen</option>
                <option value="beauty">Beauty & Personal Care</option>
                <option value="clothing">Clothing, Shoes & Jewelry</option>
                <option value="health">Health & Household</option>
                <option value="sports">Sports & Outdoors</option>
                <option value="toys-books">Toys, Games & Books</option>
              </select>
            </div>

            {/* 4. Original Price */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Original / Retail Price (₹)
              </label>
              <input
                type="number"
                name="originalPrice"
                className="form-control"
                placeholder="e.g. 5000"
                value={formData.originalPrice}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            {/* 5. Dynamic Pricing Tiers */}
            <div className="mb-4">
              <label className="form-label fw-semibold">
                🏷️ Group Pricing Tiers
                <span className="text-muted fw-normal ms-2 small">
                  (lower price unlocks as more buyers join)
                </span>
              </label>

              {tiers.map((tier, index) => (
                <div
                  key={index}
                  className="d-flex align-items-center gap-2 mb-2"
                >
                  <div className="flex-fill">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Min buyers (e.g. 5)"
                      value={tier.minUsers}
                      onChange={(e) =>
                        handleTierChange(index, "minUsers", e.target.value)
                      }
                      min="1"
                      required
                    />
                  </div>
                  <span className="text-muted">→</span>
                  <div className="flex-fill">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Group price (₹)"
                      value={tier.price}
                      onChange={(e) =>
                        handleTierChange(index, "price", e.target.value)
                      }
                      min="0"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm px-2"
                    onClick={() => removeTier(index)}
                    disabled={tiers.length === 1}
                    title="Remove this tier"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-outline-success btn-sm mt-1"
                onClick={addTier}
              >
                + Add Tier
              </button>

              <div className="form-text mt-2">
                Example: <em>5 buyers → ₹3999</em>, <em>10 buyers → ₹2999</em>,{" "}
                <em>20 buyers → ₹1999</em>
              </div>
            </div>

            {/* 6. Deadline (Full Width col-12) */}
            <div className="row">
              <div className="col-12 mb-3">
                <label className="form-label fw-semibold">Deal Deadline</label>
                <input
                  type="datetime-local"
                  name="deadline"
                  className="form-control"
                  value={formData.deadline}
                  onChange={handleChange}
                  min={minDeadline}
                  required
                />
                <div className="form-text">
                  Pool auto-resolves when this date passes.
                </div>
              </div>
            </div>

            {/* 7. Seller / Brand Name */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Seller / Brand Name</label>
              <input
                type="text"
                name="seller"
                className="form-control"
                placeholder="e.g. Acme Retailers"
                value={formData.seller}
                onChange={handleChange}
              />
            </div>

            {/* 8. Deal Description */}
            <div className="mb-4">
              <label className="form-label fw-semibold">Deal Description</label>
              <textarea
                name="description"
                className="form-control"
                rows="4"
                placeholder="Product features, group milestones, or terms..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* 9. Submit Button */}
            <button
              type="submit"
              className="btn btn-success w-100 btn-lg shadow-sm"
            >
              Launch Group Deal
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateDeal;