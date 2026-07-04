import { Link } from "react-router-dom";

function ProductCard({ id, title, image, price, category, seller, stock }) {
  const outOfStock = stock === 0;

  return (
    <Link
      to={`/product/${id}`}
      className="text-decoration-none"
      style={{ display: "block" }}
    >
      <div
        className="card h-100 border-0 shadow-sm overflow-hidden"
        style={{
          borderRadius: "16px",
          transition: "transform 0.2s, box-shadow 0.2s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "";
        }}
      >
        <div style={{ height: "200px", overflow: "hidden", position: "relative" }}>
          <img
            src={image || "/shopping.png"}
            alt={title}
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />
          {outOfStock && (
            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
              style={{ background: "rgba(0,0,0,0.45)" }}
            >
              <span className="badge bg-secondary fs-6 px-3 py-2">Out of Stock</span>
            </div>
          )}
          {category && (
            <span
              className="badge bg-dark position-absolute"
              style={{ top: "12px", left: "12px", opacity: 0.85 }}
            >
              {category}
            </span>
          )}
        </div>

        <div className="card-body d-flex flex-column p-3">
          <h6
            className="fw-bold mb-1 text-dark"
            style={{
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: "1.4",
              minHeight: "40px",
            }}
          >
            {title}
          </h6>

          <p className="text-muted small mb-2" style={{ fontSize: "12px" }}>
            {seller || "GroupBuy Store"}
          </p>

          <div className="mt-auto d-flex align-items-center justify-content-between">
            <h5 className="text-success fw-bold mb-0">₹{price?.toLocaleString("en-IN")}</h5>
            {stock > 0 && (
              <small className="text-muted">{stock} left</small>
            )}
          </div>

          <button
            className={`btn btn-sm w-100 mt-3 ${outOfStock ? "btn-secondary" : "btn-dark"}`}
            disabled={outOfStock}
            style={{ borderRadius: "8px" }}
          >
            {outOfStock ? "Out of Stock" : "View Product"}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
