function CategoryCard({
  title,
  items,
  linkText
}) {

  return (
    <div
      className="card shadow-sm h-100"
      style={{ width: "320px" }}
    >

      <div className="card-body">

        <h5 className="fw-bold mb-3">
          {title}
        </h5>

        <div className="row">

          {items.map((item, index) => (

            <div
              key={index}
              className="col-6 mb-3"
            >

              <img
                src={item.image}
                alt={item.label}
                className="img-fluid rounded"
                style={{
                  height: "120px",
                  width: "100%",
                  objectFit: "cover"
                }}
              />

              <small>
                {item.label}
              </small>

            </div>

          ))}

        </div>

        <a
          href="#"
          className="text-decoration-none"
        >
          {linkText}
        </a>

      </div>

    </div>
  );
}

export default CategoryCard;