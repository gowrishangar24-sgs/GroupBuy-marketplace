import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const CATEGORY_META = {
  electronics:   { label: "Electronics",   emoji: "💻", path: "/electronics"   },
  "home-kitchen": { label: "Home & Kitchen", emoji: "🏠", path: "/home-kitchen" },
  beauty:       { label: "Beauty",         emoji: "💄", path: "/beauty"        },
  clothing:     { label: "Clothing",       emoji: "👕", path: "/clothing"      },
  health:       { label: "Health",         emoji: "🏥", path: "/health"        },
  sports:       { label: "Sports",         emoji: "⚽", path: "/sports"        },
  "toys-books": { label: "Toys & Books",   emoji: "📚", path: "/toysbooks"    },
};

const FALLBACK_ORDER = Object.keys(CATEGORY_META);

function CategoryNavbar() {
  const location = useLocation();
  const [categories, setCategories] = useState(FALLBACK_ORDER.map((k) => ({ key: k, count: 0 })));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Clean & Relative: Prepends the centralized baseURL automatically
    axios
      .get("/products/categories/stats")
      .then((res) => {
        if (res.data.success) {
          const dbMap = {};
          res.data.categories.forEach((c) => { dbMap[c._id] = c.count; });

          const merged = FALLBACK_ORDER.map((key) => ({
            key,
            count: dbMap[key] || 0,
          }));
          merged.sort((a, b) => b.count - a.count);
          setCategories(merged);
        }
      })
      .catch(() => {
        // silently keep fallback
      })
      .finally(() => setLoading(false));
  }, []);

  const isActive = (path) =>
    location.pathname.toLowerCase() === path.toLowerCase() ||
    location.pathname.toLowerCase().startsWith(path.toLowerCase() + "/");

  return (
    <nav
      className="border-bottom bg-white navbar navbar-expand py-1"
      style={{ 
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        zIndex: 999 
      }}
    >
      <div
        className="container-fluid justify-content-start justify-content-md-center d-flex align-items-center flex-nowrap gap-1 overflow-x-auto px-2"
        style={{ 
          whiteSpace: "nowrap",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch"
        }}
      >
        <style>{`
          .container-fluid::-webkit-scrollbar {
            display: none !important;
          }
        `}</style>

        {categories.map(({ key, count }) => {
          const meta = CATEGORY_META[key];
          if (!meta) return null;
          const active = isActive(meta.path);

          return (
            <Link
              key={key}
              to={meta.path}
              className="text-decoration-none d-flex flex-column align-items-center justify-content-center text-center px-2 py-2 flex-shrink-0 category-navbar-item"
              style={{
                borderBottom: active ? "2px solid #198754" : "2px solid transparent",
                color: active ? "#198754" : "#555",
                fontWeight: active ? "600" : "400",
                fontSize: "12px",
                transition: "all 0.15s",
                minWidth: "85px",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.borderBottomColor = "#aaa";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.borderBottomColor = "transparent";
              }}
            >
              <span style={{ fontSize: "18px", lineHeight: 1 }}>{meta.emoji}</span>
              <span className="mt-1" style={{ maxWidth: "100px", lineHeight: "1.2" }}>
                {meta.label}
              </span>
              {count > 0 && (
                <span
                  className="badge mt-1"
                  style={{
                    fontSize: "9px",
                    backgroundColor: active ? "#198754" : "#e9ecef",
                    color: active ? "#fff" : "#666",
                    padding: "1px 5px",
                  }}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default CategoryNavbar;