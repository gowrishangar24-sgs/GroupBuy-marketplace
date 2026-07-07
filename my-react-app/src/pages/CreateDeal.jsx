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
  targetMembers: "",
  seller: "",
  // deadline replaces the old daysLeft number field
  deadline: "",
};

function CreateDeal() {
  const [formData, setFormData] = useState(emptyForm);
  // Start with one empty tier so the form doesn't look blank
  const [tiers, setTiers] = useState([emptyTier()]);
  const navigate = useNavigate();

  // ── Minimum deadline date: tomorrow ──────────────────────────
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDeadline = tomorrow.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

    if (Number(formData.targetMembers) < 2) {
      alert("Target Members must be at least 2");
      return;
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

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/deals/create",
        { ...formData, tiers: parsedTiers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(res.data);
      alert("Deal Created Successfully!");
      setFormData(emptyForm);
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

            {/* 1. Basic Info */}
            <div className="mb-3">
              <label className="form-label">Deal Title</label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Image URL</label>
              <input
                type="text"
                name="image"
                className="form-control"
                placeholder="https://..."
                value={formData.image}
                onChange={handleChange}
              />
            </div>

            {/* 2. Category */}
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

            {/* 3. Original Price */}
            <div className="mb-3">
              <label className="form-label">Original / Retail Price (₹)</label>
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

            {/* 4. Dynamic Pricing Tiers ─────────────────────────── */}
            <div className="mb-4">
              <label className="form-label fw-semibold">
                🏷️ Group Pricing Tiers
                <span className="text-muted fw-normal ms-2 small">
                  (lower price unlocks as more buyers join)
                </span>
              </label>

              {tiers.map((tier, index) => (
                <div key={index} className="d-flex align-items-center gap-2 mb-2">
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

            {/* 5. Group Threshold & Deadline */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Target Members</label>
                <input
                  type="number"
                  name="targetMembers"
                  className="form-control"
                  placeholder="e.g. 20"
                  value={formData.targetMembers}
                  onChange={handleChange}
                  min="2"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Deal Deadline</label>
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

            {/* 6. Seller / Brand Name */}
            <div className="mb-3">
              <label className="form-label">Seller / Brand Name</label>
              <input
                type="text"
                name="seller"
                className="form-control"
                value={formData.seller}
                onChange={handleChange}
              />
            </div>

            {/* 7. Description */}
            <div className="mb-4">
              <label className="form-label">Deal Description</label>
              <textarea
                name="description"
                className="form-control"
                rows="4"
                placeholder="Product features, group milestones, or terms..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* 8. Submit */}
            <button type="submit" className="btn btn-success w-100 btn-lg shadow-sm">
              Launch Group Deal
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateDeal;
