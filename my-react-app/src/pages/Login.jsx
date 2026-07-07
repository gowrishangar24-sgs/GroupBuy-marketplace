import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";

// ✅ Clean & Relative: App.jsx handles the base path prefix automatically
const API = "/auth";

function Login() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  // ── RECOVERY APP MODE CONFIG ──
  const [mode, setMode] = useState("login"); // "login" | "forgot" | "reset"
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await axios.post(`${API}/login`, { 
        email: email.toLowerCase().trim(), 
        password 
      });
      
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/");
        window.location.reload();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password combination.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await axios.post(`${API}/forgot-password`, { email: email.toLowerCase().trim() });
      if (res.data.success) {
        setSuccessMsg("Verification reset code dispatched to your email inbox!");
        setMode("reset");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to issue password recovery execution pipeline.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API}/reset-password`, {
        email: email.toLowerCase().trim(),
        otp: resetCode.trim(),
        newPassword
      });
      if (res.data.success) {
        alert("Password updated successfully! Please log in with your fresh credentials.");
        setMode("login");
        setPassword("");
        setResetCode("");
        setNewPassword("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update target account secret credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <div 
        className="min-vh-100 d-flex align-items-center justify-content-center py-5"
        style={{ background: "linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 50%, #0d0d0d 100%)" }}
      >
        <div className="w-100" style={{ maxWidth: "420px", padding: "0 16px" }}>
          
          <div className="text-center mb-4">
            <img src="/title.png" alt="GroupBuy" height="48" className="mb-3" />
            <h4 className="text-white fw-bold mb-1">
              {mode === "login" && "Welcome back"}
              {mode === "forgot" && "Reset Password"}
              {mode === "reset" && "Enter Security Code"}
            </h4>
            <p className="text-secondary small">
              {mode === "login" && "Sign in to access your active group purchases"}
              {mode === "forgot" && "Provide your email address to look up your profile credentials"}
              {mode === "reset" && "Provide the security verification sequence sent to your inbox"}
            </p>
          </div>

          <div className="card border-0 shadow-lg" style={{ borderRadius: "16px", background: "#1c1c1e" }}>
            <div className="card-body p-4">
              
              {error && (
                <div className="alert alert-danger py-2 small mb-3 text-center">{error}</div>
              )}
              {successMsg && (
                <div className="alert alert-success py-2 small mb-3 text-center">{successMsg}</div>
              )}

              {/* ── MODE 1: LOGIN RENDER VIEW ── */}
              {mode === "login" && (
                <form onSubmit={handleLoginSubmit} noValidate>
                  <div className="mb-3">
                    <label className="form-label text-light small fw-semibold">Email ID</label>
                    <input 
                      type="email" 
                      className="form-control bg-dark text-white border-secondary" 
                      placeholder="name@gmail.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      autoComplete="email"
                      required 
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label text-light small fw-semibold">Password</label>
                    <input 
                      type="password" 
                      className="form-control bg-dark text-white border-secondary" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      autoComplete="current-password"
                      required 
                    />
                  </div>

                  <div className="text-end mb-4">
                    <button 
                      type="button" 
                      className="btn btn-link p-0 small text-success text-decoration-none fw-semibold"
                      onClick={() => { setMode("forgot"); setError(""); setSuccessMsg(""); }}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-success w-100 fw-bold py-2 shadow-sm" 
                    disabled={loading}
                    style={{ borderRadius: "10px", fontSize: "15px" }}
                  >
                    {loading ? <><span className="spinner-border spinner-border-sm me-2" />Authenticating...</> : "Sign In"}
                  </button>
                </form>
              )}

              {/* ── MODE 2: FORGOT PASSWORD REQUEST VIEW ── */}
              {mode === "forgot" && (
                <form onSubmit={handleForgotSubmit} noValidate>
                  <div className="mb-4">
                    <label className="form-label text-light small fw-semibold">Registered Email Address</label>
                    <input 
                      type="email" 
                      className="form-control bg-dark text-white border-secondary custom-add-input" 
                      placeholder="Enter your profile account email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-success w-100 fw-bold py-2 shadow-sm mb-2" 
                    disabled={loading}
                    style={{ borderRadius: "10px" }}
                  >
                    {loading ? "Issuing Verification Code..." : "Send Reset Code"}
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary w-100 text-light py-2 border-secondary"
                    onClick={() => { setMode("login"); setError(""); }}
                    style={{ borderRadius: "10px" }}
                  >
                    Back to Login
                  </button>
                </form>
              )}

              {/* ── MODE 3: RESET PASSWORD SUBMISSION VIEW ── */}
              {mode === "reset" && (
                <form onSubmit={handleResetSubmit} noValidate>
                  <div className="mb-3">
                    <label className="form-label text-light small fw-semibold">6-Digit Verification Code</label>
                    <input 
                      type="text" 
                      className="form-control bg-dark text-white border-secondary text-center fw-bold custom-add-input" 
                      placeholder="000000"
                      maxLength={6}
                      value={resetCode} 
                      onChange={(e) => setResetCode(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-light small fw-semibold">New Account Password</label>
                    <input 
                      type="password" 
                      className="form-control bg-dark text-white border-secondary custom-add-input" 
                      placeholder="At least 1 letter and 1 number" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      required 
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-success w-100 fw-bold py-2 shadow-sm mb-2" 
                    disabled={loading}
                    style={{ borderRadius: "10px" }}
                  >
                    {loading ? "Saving Changes..." : "Update Password"}
                  </button>
                </form>
              )}

              {mode === "login" && (
                <p className="text-center small mt-4 mb-0 text-secondary">
                  New to GroupBuy?{" "}
                  <Link to="/signup" className="text-success fw-bold text-decoration-none">Sign up now</Link>
                </p>
              )}

            </div>
          </div>
        </div>
      </div>

      <style>{`
        .form-control.bg-dark::placeholder { color: #6c757d; }
        .form-control.bg-dark:focus { border-color: #198754 !important; box-shadow: 0 0 0 2px rgba(25,135,84,0.25); background: #1c1c1e; color: white; }
        
        .custom-add-input:focus {
          color: #212529 !important;
          background-color: #ffffff !important;
        }
      `}</style>
      <Footer />
    </>
  );
}

export default Login;