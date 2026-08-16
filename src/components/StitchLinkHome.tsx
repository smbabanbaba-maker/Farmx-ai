import { useMemo, useState } from "react";
import {
  Bell,
  ChevronRight,
  Heart,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Store,
  Tag,
  X,
} from "lucide-react";

const categories = [
  { name: "Clothing", icon: "◌", tone: "#ead9cf" },
  { name: "Fabrics", icon: "✦", tone: "#ded9eb" },
  { name: "Sewing", icon: "⌁", tone: "#d7e5db" },
  { name: "Shoes", icon: "◒", tone: "#e8e0cb" },
  { name: "Bags", icon: "▱", tone: "#e5d7d7" },
  { name: "Jewelry", icon: "◇", tone: "#e9dfc4" },
  { name: "Modest", icon: "✧", tone: "#d6e0e8" },
  { name: "Beauty", icon: "⌇", tone: "#e8d5df" },
];

const products = [
  {
    id: 1,
    name: "Hand-dyed Ankara set",
    price: "₦68,000",
    location: "Ikeja, Lagos",
    seller: "Aso Oke Studio",
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=85",
    tag: "New arrival",
    verified: true,
  },
  {
    id: 2,
    name: "Premium French lace",
    price: "₦42,500",
    location: "Wuse 2, Abuja",
    seller: "Luxe Textiles",
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=85",
    tag: "Trending",
    verified: true,
  },
  {
    id: 3,
    name: "Leather everyday tote",
    price: "₦35,000",
    location: "Yaba, Lagos",
    seller: "Mina Leatherworks",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=85",
    tag: "Popular",
    verified: false,
  },
  {
    id: 4,
    name: "Minimal gold watch",
    price: "₦55,000",
    location: "GRA, Port Harcourt",
    seller: "The Watch Edit",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=85",
    tag: "Verified shop",
    verified: true,
  },
  {
    id: 5,
    name: "Silk boubou kaftan",
    price: "₦89,000",
    location: "Surulere, Lagos",
    seller: "Nura Modest",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85",
    tag: "Just added",
    verified: true,
  },
  {
    id: 6,
    name: "Industrial sewing machine",
    price: "₦245,000",
    location: "Onitsha, Anambra",
    seller: "SewPro Supplies",
    image:
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=85",
    tag: "For makers",
    verified: true,
  },
];

function ProductCard({ product }: { product: (typeof products)[number] }) {
  const [saved, setSaved] = useState(false);
  return (
    <article className="st-product-card">
      <div className="st-product-image-wrap">
        <img src={product.image} alt={product.name} className="st-product-image" />
        <span className="st-product-tag">{product.tag}</span>
        <button
          className={`st-save ${saved ? "is-saved" : ""}`}
          onClick={() => setSaved(!saved)}
          aria-label="Save product"
        >
          <Heart size={16} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="st-product-body">
        <h3>{product.name}</h3>
        <p className="st-price">{product.price}</p>
        <div className="st-meta">
          <MapPin size={12} /> {product.location}
        </div>
        <div className="st-seller">
          <span>{product.seller}</span>
          {product.verified && <ShieldCheck size={14} className="st-verified" />}
        </div>
      </div>
    </article>
  );
}

export function StitchLinkHome() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const visibleProducts = useMemo(() => {
    const needle = query.toLowerCase();
    return products.filter(
      (p) => !needle || `${p.name} ${p.seller} ${p.location}`.toLowerCase().includes(needle),
    );
  }, [query]);

  return (
    <main className="st-home">
      <section className="st-hero">
        <div className="st-hero-copy">
          <p className="st-eyebrow">THE NEW WAY TO DISCOVER STYLE</p>
          <h1>
            Find pieces that
            <br />
            <em>feel like you.</em>
          </h1>
          <p className="st-hero-sub">
            Shop fashion, fabrics and tools from independent sellers across Nigeria.
          </p>
          <div className="st-search st-search-large">
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, shops or categories"
            />
            <button onClick={() => setShowFilters(!showFilters)} aria-label="Filters">
              <SlidersHorizontal size={17} />
            </button>
          </div>
          {showFilters && (
            <div className="st-filter-popover">
              <span>Filter by</span>
              <button>Price</button>
              <button>Location</button>
              <button>Condition</button>
              <button className="st-close-filter" onClick={() => setShowFilters(false)}>
                <X size={14} />
              </button>
            </div>
          )}
        </div>
        <div className="st-hero-art">
          <div className="st-art-circle" />
          <img
            src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85"
            alt="Fashion editorial"
          />
        </div>
      </section>

      <section className="st-section st-category-section">
        <div className="st-section-heading">
          <div>
            <p className="st-kicker">BROWSE BY MOOD</p>
            <h2>Explore categories</h2>
          </div>
          <button className="st-text-button">
            View all <ChevronRight size={16} />
          </button>
        </div>
        <div className="st-category-row">
          {categories.map((category) => (
            <button
              key={category.name}
              className="st-category"
              onClick={() => setActiveCategory(category.name)}
            >
              <span style={{ background: category.tone }}>{category.icon}</span>
              <strong>{category.name}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="st-section">
        <div className="st-section-heading">
          <div>
            <p className="st-kicker">CURATED FOR YOU</p>
            <h2>Featured products</h2>
          </div>
          <button className="st-text-button">
            See all <ChevronRight size={16} />
          </button>
        </div>
        <div className="st-chips">
          <button
            className={activeCategory === "All" ? "active" : ""}
            onClick={() => setActiveCategory("All")}
          >
            All
          </button>
          {["New arrivals", "Popular", "Near you"].map((chip) => (
            <button
              key={chip}
              className={activeCategory === chip ? "active" : ""}
              onClick={() => setActiveCategory(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
        <div className="st-product-grid">
          {visibleProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="st-feature-banner">
        <div>
          <p className="st-kicker">FOR THE MAKERS</p>
          <h2>
            Everything you need
            <br />
            to make it yours.
          </h2>
          <p>From rare fabrics to professional sewing machines, find your next creative spark.</p>
          <button className="st-dark-button">
            Shop sewing & materials <ChevronRight size={16} />
          </button>
        </div>
        <div className="st-banner-image">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=85"
            alt="Sewing materials"
          />
        </div>
      </section>

      <section className="st-section st-bottom-section">
        <div className="st-section-heading">
          <div>
            <p className="st-kicker">MEET THE COMMUNITY</p>
            <h2>Shops worth following</h2>
          </div>
          <button className="st-text-button">
            Explore shops <ChevronRight size={16} />
          </button>
        </div>
        <div className="st-shops">
          <div className="st-shop-card">
            <div className="st-shop-avatar">AO</div>
            <div>
              <h3>
                Aso Oke Studio <ShieldCheck size={14} className="st-verified" />
              </h3>
              <p>Textiles · Lagos</p>
              <span>
                <Star size={12} fill="currentColor" /> 4.9 · 128 products
              </span>
            </div>
            <button className="st-follow">Follow</button>
          </div>
          <div className="st-shop-card">
            <div className="st-shop-avatar st-avatar-pink">NM</div>
            <div>
              <h3>
                Nura Modest <ShieldCheck size={14} className="st-verified" />
              </h3>
              <p>Modest fashion · Abuja</p>
              <span>
                <Star size={12} fill="currentColor" /> 4.8 · 64 products
              </span>
            </div>
            <button className="st-follow">Follow</button>
          </div>
        </div>
      </section>
    </main>
  );
}
