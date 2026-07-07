import { BrowserRouter as Router } from "react-router-dom"; // or your other imports
import axios from "axios";

// ⚡ Global Axios Configuration
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || "";
axios.defaults.withCredentials = true;
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageLoader from "./components/PageLoader";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SellerDashboard from "./pages/SellerDashboard";
import AddProduct from "./pages/AddProduct";
import ProductDetails from "./pages/ProductDetails";
import SearchResults from "./pages/SearchResults";
import CreateDeal from "./pages/CreateDeal";
import MyDeals from "./pages/MyDeals";
import Account from "./pages/Account";
import Cart from "./pages/Cart";
import Wishlist from "./pages/WishList";
import HelpCenter from "./pages/HelpCenter";
import ContactUs from "./pages/ContactUs";
import FAQs from "./pages/FAQs";

// ✅ One reusable component replaces 7 near-identical category pages
import CategoryPage from "./pages/CategoryPage";

import ElectronicsOffer from "./pages/offers/ElectronicsOffer";
import BeautyOffer from "./pages/offers/BeautyOffer";
import KitchenOffer from "./pages/offers/KitchenOffer";
import FashionOffer from "./pages/offers/FashionOffer";
import SportsOffer from "./pages/offers/SportsOffer";
import BoatOffer from "./pages/offers/BoatOffer";

// Category page config
const CATEGORIES = [
  {
    paths: ["/electronics", "/Electronics"],
    props: {
      categoryKey: "electronics",
      label: "Electronics & Gadgets",
      emoji: "💻",
      gradient: "linear-gradient(135deg,#0f172a,#1e293b,#0f172a)",
      description: "Group deals on headphones, smartwatches, keyboards, and more.",
      dealEmoji: "🔥",
    },
  },
  {
    paths: ["/home-kitchen", "/HomeKitchen"],
    props: {
      categoryKey: "home-kitchen",
      label: "Home & Kitchen",
      emoji: "🏠",
      gradient: "linear-gradient(135deg,#78350f,#92400e,#78350f)",
      description: "Pool orders on cookware, furniture, and storage.",
      dealEmoji: "🏠",
    },
  },
  {
    paths: ["/beauty", "/Beauty"],
    props: {
      categoryKey: "beauty",
      label: "Beauty & Personal Care",
      emoji: "💄",
      gradient: "linear-gradient(135deg,#be185d,#db2777,#be185d)",
      description: "Discover skincare, cosmetics, and beauty savings.",
      dealEmoji: "💄",
    },
  },
  {
    paths: ["/clothing", "/Clothing"],
    props: {
      categoryKey: "clothing",
      label: "Clothing, Shoes & Jewelry",
      emoji: "👕",
      gradient: "linear-gradient(135deg,#7c2d12,#b45309,#7c2d12)",
      description: "Community volume orders on fashion lines.",
      dealEmoji: "👕",
    },
  },
  {
    paths: ["/health", "/Health"],
    props: {
      categoryKey: "health",
      label: "Health & Household",
      emoji: "🏥",
      gradient: "linear-gradient(135deg,#166534,#22c55e,#166534)",
      description: "Wholesale pricing on daily wellness products.",
      dealEmoji: "🏥",
    },
  },
  {
    paths: ["/sports", "/Sports"],
    props: {
      categoryKey: "sports",
      label: "Sports & Outdoors",
      emoji: "⚽",
      gradient: "linear-gradient(135deg,#0f766e,#14b8a6,#0f766e)",
      description: "Factory discounts on gear with your fitness group.",
      dealEmoji: "🏆",
    },
  },
  {
    paths: ["/toysbooks", "/ToysBooks"],
    props: {
      categoryKey: "toys-books",
      label: "Toys, Games & Books",
      emoji: "📚",
      gradient: "linear-gradient(135deg,#7e22ce,#a855f7,#7e22ce)",
      description: "Group price cuts on learning sets and reading bundles.",
      dealEmoji: "📚",
    },
  },
];

function App() {
  return (
    <BrowserRouter>
    <PageLoader>
      <Routes>
        {/* Core Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/account" element={<Account />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/search" element={<SearchResults />} />

        {/* Seller Routes */}
        <Route path="/SellerDashboard" element={<SellerDashboard />} />
        <Route path="/AddProduct" element={<AddProduct />} />
        <Route path="/CreateDeal" element={<CreateDeal />} />
        <Route path="/MyDeals" element={<MyDeals />} />

        {/* Product / Deal Detail */}
        <Route path="/product/:id" element={<ProductDetails />} />

        {/* ✅ Dynamic category routes — generated from config array */}
        {CATEGORIES.map(({ paths, props }) =>
          paths.map((path) => (
            <Route key={path} path={path} element={<CategoryPage {...props} />} />
          ))
        )}

        {/* Offer Pages */}
        <Route path="/offers/ElectronicsOffer" element={<ElectronicsOffer />} />
        <Route path="/offers/BeautyOffer" element={<BeautyOffer />} />
        <Route path="/offers/KitchenOffer" element={<KitchenOffer />} />
        <Route path="/offers/FashionOffer" element={<FashionOffer />} />
        <Route path="/offers/SportsOffer" element={<SportsOffer />} />
        <Route path="/offers/BoatOffer" element={<BoatOffer />} />
        <Route path="/help-center" element={<HelpCenter />} />
<Route path="/contact-us" element={<ContactUs />} />
<Route path="/faqs" element={<FAQs />} />
      </Routes>
      </PageLoader>
    </BrowserRouter>
  );
}

export default App;
