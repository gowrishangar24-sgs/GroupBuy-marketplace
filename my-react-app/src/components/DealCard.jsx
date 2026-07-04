import { Link } from "react-router-dom";

// ─────────────────────────────────────────────────────────────
// Helper: given the tiers array and the current joinedUsers count,
// return the currently-active group price.
// Falls back to the lowest tier price so there's always a number
// to show even before the first threshold is crossed.
// ─────────────────────────────────────────────────────────────
function resolveActiveTierPrice(tiers, joinedUsers) {
  if (!Array.isArray(tiers) || tiers.length === 0) return null;
  const sorted = [...tiers].sort((a, b) => b.minUsers - a.minUsers);
  const active = sorted.find((t) => joinedUsers >= t.minUsers);
  return active ? active.price : sorted[sorted.length - 1].price;
}

function DealCard({
  id,
  title,
  image,
  originalPrice,
  // `tiers` is the new dynamic pricing matrix: [{ minUsers, price }]
  // `activeTierPrice` may be pre-computed by the API response;
  // if not present we compute it from tiers + joined.
  tiers,
  activeTierPrice: activeTierPriceProp,
  joined,
  target,
  seller,
  daysLeft,
}) {
  // Resolve the displayed group price from whichever prop is available
  const groupPrice =
    activeTierPriceProp !== undefined && activeTierPriceProp !== null
      ? activeTierPriceProp
      : resolveActiveTierPrice(tiers, joined ?? 0);

  const progress = target > 0 ? Math.min((joined / target) * 100, 100) : 0;

  const discount =
    originalPrice && groupPrice
      ? Math.round(((originalPrice - groupPrice) / originalPrice) * 100)
      : 0;

  // Find the next unlock milestone so we can show a teaser
  const nextTier =
    Array.isArray(tiers) && tiers.length > 0
      ? [...tiers]
          .sort((a, b) => a.minUsers - b.minUsers)
          .find((t) => t.minUsers > (joined ?? 0))
      : null;

  return (
    <Link to={`/product/${id}`} className="text-decoration-none">
      <div
        className="card h-100 border-0 shadow-lg overflow-hidden"
        style={{ borderRadius: "20px", transition: "0.3s" }}
      >
        {/* Discount Badge */}
        {discount > 0 && (
          <div
            className="position-absolute bg-danger text-white fw-bold px-3 py-2"
            style={{ top: "15px", left: "15px", zIndex: 2, borderRadius: "50px" }}
          >
            {discount}% OFF
          </div>
        )}

        {/* Product Image */}
        <div style={{ height: "240px", overflow: "hidden" }}>
          <img
            src={image || "/shopping.png"}
            alt={title}
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />
        </div>

        <div className="card-body">
          <h5 className="fw-bold mb-2">{title}</h5>

          <p className="text-muted small mb-3">
            Seller: {seller || "GroupBuy Store"}
          </p>

          {/* Current group price + original */}
          <div className="mb-2">
            <h4 className="text-success fw-bold mb-0">
              ₹{groupPrice !== null ? groupPrice : "—"}
            </h4>
            <span className="text-muted text-decoration-line-through me-2">
              ₹{originalPrice}
            </span>
            <span className="badge bg-success">Group Price</span>
          </div>

          {/* Next tier teaser */}
          {nextTier && (
            <div className="alert alert-info py-1 px-2 small mb-2">
              🔓 {nextTier.minUsers - (joined ?? 0)} more to unlock ₹{nextTier.price}
            </div>
          )}

          {/* Tiers summary (collapsed pill list) */}
          {Array.isArray(tiers) && tiers.length > 1 && (
            <div className="d-flex flex-wrap gap-1 mb-3">
              {[...tiers]
                .sort((a, b) => a.minUsers - b.minUsers)
                .map((t, i) => {
                  const isActive = groupPrice === t.price;
                  return (
                    <span
                      key={i}
                      className={`badge ${isActive ? "bg-success" : "bg-light text-dark border"}`}
                      style={{ fontSize: "11px" }}
                    >
                      {t.minUsers}+ → ₹{t.price}
                    </span>
                  );
                })}
            </div>
          )}

          {/* Progress bar */}
          <div className="d-flex justify-content-between mb-1">
            <span className="small">👥 Joined</span>
            <span className="fw-bold small">
              {joined}/{target}
            </span>
          </div>
          <div className="progress mb-3" style={{ height: "10px" }}>
            <div
              className="progress-bar bg-success"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="alert alert-warning py-2 small mb-3">
            ⏰ {daysLeft ?? 0} Days Left
          </div>

          <button className="btn btn-success w-100">View Deal</button>
        </div>
      </div>
    </Link>
  );
}

export default DealCard;
