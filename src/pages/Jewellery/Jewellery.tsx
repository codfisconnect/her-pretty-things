import { Link } from 'react-router-dom'

function Jewellery() {
  return (
    <section className="jewellery-page container">
      <div className="jewellery-intro">
        <p className="eyebrow">Collection 02</p>

        <h1>Jewellery</h1>

        <p>
          Delicate details, everyday sparkle, and pretty little pieces
          designed to make every outfit feel a little more special.
        </p>
      </div>

      <div className="jewellery-product-grid">

        {/* Product 1 */}
        <article className="jewellery-product">
          <Link
            to="/product/gold-tone-floral-necklace-earrings-set"
            className="jewellery-product-image"
          >
            <img
              src="/images/gold-floral-necklace.png"
              alt="Gold-Tone Floral Necklace & Earrings Set"
            />
          </Link>

          <div className="jewellery-product-info">
            <p className="jewellery-product-category">
              Jewellery
            </p>

            <h2>
              <Link to="/product/gold-tone-floral-necklace-earrings-set">
                Gold-Tone Floral Necklace & Earrings Set
              </Link>
            </h2>

            <p className="jewellery-product-price">
              ₹699
            </p>

            <div className="jewellery-product-badges">
              <span>Anti-Tarnish</span>
              <span>Lightweight</span>
            </div>

            <button
              type="button"
              className="jewellery-view-button"
            >
              MAKE IT YOURS
            </button>
          </div>
        </article>

        {/* Product 2 */}
<article className="jewellery-product">
  <Link
    to="/product/glossy-red-cherry-drop-earrings"
    className="jewellery-product-image"
  >
    <img
      src="/images/glossy-red-cherry-drop-earrings.png"
      alt="Glossy Red Cherry Drop Earrings"
    />
  </Link>

  <div className="jewellery-product-info">
    <p className="jewellery-product-category">
      Jewellery
    </p>

    <h2>
      <Link to="/product/glossy-red-cherry-drop-earrings">
        Glossy Red Cherry Drop Earrings
      </Link>
    </h2>

    <p className="jewellery-product-price">
      ₹999
    </p>

    <div className="jewellery-product-badges">
      <span>Lightweight</span>
      <span>Statement Wear</span>
    </div>

    <button
      type="button"
      className="jewellery-view-button"
    >
      MAKE IT YOURS
    </button>
  </div>
</article>

        {/* Temporary Product 3 */}
        <article className="jewellery-product">
          <div className="jewellery-product-image">
            <img
              src="/images/gold-floral-necklace.png"
              alt="Golden Pearl Bracelet"
            />
          </div>

          <div className="jewellery-product-info">
            <p className="jewellery-product-category">
              Jewellery
            </p>

            <h2>
              Golden Pearl Bracelet
            </h2>

            <p className="jewellery-product-price">
              ₹599
            </p>

            <div className="jewellery-product-badges">
              <span>Anti-Tarnish</span>
            </div>

            <button
              type="button"
              className="jewellery-view-button"
            >
              MAKE IT YOURS
            </button>
          </div>
        </article>

        {/* Temporary Product 4 */}
        <article className="jewellery-product">
          <div className="jewellery-product-image">
            <img
              src="/images/gold-floral-necklace.png"
              alt="Everyday Gold-Tone Set"
            />
          </div>

          <div className="jewellery-product-info">
            <p className="jewellery-product-category">
              Jewellery
            </p>

            <h2>
              Everyday Gold-Tone Set
            </h2>

            <p className="jewellery-product-price">
              ₹799
            </p>

            <div className="jewellery-product-badges">
              <span>Complete Set</span>
            </div>

            <button
              type="button"
              className="jewellery-view-button"
            >
              MAKE IT YOURS
            </button>
          </div>
        </article>

      </div>
    </section>
  )
}

export default Jewellery