import Navbar from "../components/Navbar";
import axios from "axios";
import { useState } from "react";

const emptyForm = {
  title: "",
  image: "",
  originalPrice: "",
  groupPrice: "",
  targetMembers: "",
  seller: "",
  daysLeft: "",
};

function CreateDeal() {
  const [formData, setFormData] = useState(emptyForm);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/deals/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(res.data);
      alert("Deal Created Successfully!");
      setFormData(emptyForm);

    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || "Error Creating Deal"
      );
    }
  };

  return (
    <>
      <Navbar />

      <div className="container mt-5">
        <div className="card shadow p-4">
          <h2 className="mb-4">Create a New Deal</h2>

          <form onSubmit={handleSubmit}>

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
                value={formData.image}
                onChange={handleChange}
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Original Price (₹)</label>
                <input
                  type="number"
                  name="originalPrice"
                  className="form-control"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Group Price (₹)</label>
                <input
                  type="number"
                  name="groupPrice"
                  className="form-control"
                  value={formData.groupPrice}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                {/* ✅ Fixed: was name="target", backend expects "targetMembers" */}
                <label className="form-label">Target Members</label>
                <input
                  type="number"
                  name="targetMembers"
                  className="form-control"
                  value={formData.targetMembers}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Days Left</label>
                <input
                  type="number"
                  name="daysLeft"
                  className="form-control"
                  value={formData.daysLeft}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Seller Name</label>
              <input
                type="text"
                name="seller"
                className="form-control"
                value={formData.seller}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-success w-100">
              🚀 Create Deal
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateDeal;