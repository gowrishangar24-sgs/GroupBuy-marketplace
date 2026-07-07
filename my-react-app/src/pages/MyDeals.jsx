import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

// Resolve the currently active group price from a deal's tiers array
function resolveActiveTierPrice(tiers, joinedUsers) {
  if (!Array.isArray(tiers) || tiers.length === 0) return null;
  const sorted = [...tiers].sort((a, b) => b.minUsers - a.minUsers);
  const active = sorted.find((t) => joinedUsers >= t.minUsers);
  return active ? active.price : sorted[sorted.length - 1].price;
}

function MyDeals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("/deals/my-deals", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setDeals(res.data.deals))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (dealId) => {
    if (!window.confirm("Delete this deal?")) return;
    try {
      await axios.delete(`/deals/${dealId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeals(deals.filter((d) => d._id !== dealId));
      alert("Deal deleted");
    } catch (err) {
      alert("Failed to delete deal");
    }
  };

  return (
    <>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="container mt-5 mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">My Deals</h2>
          <a href="/CreateDeal" className="btn btn-success">
            + Create New Deal
          </a>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" />
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">You haven't created any deals yet.</p>
            <a href="/CreateDeal" className="btn btn-success">
              Create Your First Deal
            </a>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Deal Title</th>
                  <th>Current Price</th>
                  <th>Tiers</th>
                  <th>Target</th>
                  <th>Joined</th>
                  <th>Days Left</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => {
                  const activePrice =
                    deal.activeTierPrice ??
                    resolveActiveTierPrice(deal.tiers, deal.joinedUsers);

                  return (
                    <tr key={deal._id}>
                      <td className="fw-semibold">{deal.title}</td>

                      {/* Current unlocked group price */}
                      <td className="text-success fw-bold">
                        {activePrice !== null ? `₹${activePrice}` : "—"}
                      </td>

                      {/* Tiers summary */}
                      <td>
                        {Array.isArray(deal.tiers) && deal.tiers.length > 0 ? (
                          <div className="d-flex flex-wrap gap-1">
                            {[...deal.tiers]
                              .sort((a, b) => a.minUsers - b.minUsers)
                              .map((t, i) => (
                                <span
                                  key={i}
                                  className={`badge ${
                                    activePrice === t.price
                                      ? "bg-success"
                                      : "bg-light text-dark border"
                                  }`}
                                  style={{ fontSize: "11px" }}
                                >
                                  {t.minUsers}+→₹{t.price}
                                </span>
                              ))}
                          </div>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>

                      <td>{deal.targetMembers}</td>
                      <td>{deal.joinedUsers}</td>
                      <td>{deal.daysLeft ?? 0}</td>

                      <td>
                        <span
                          className={`badge ${
                            deal.status === "completed"
                              ? "bg-success"
                              : deal.status === "cancelled"
                              ? "bg-danger"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {deal.status}
                        </span>
                      </td>

                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(deal._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

export default MyDeals;
