import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/auth` 
  : "http://localhost:5000/api/auth";

function Signup() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = form, 2 = OTP entry
  const [loading, setLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [usernameStatus, setUsernameStatus] = useState(null); // null | "checking" | "available" | "taken"
  const usernameDebounce = useRef(null);

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    dob: "",
    email: "",
    password: "",
    role: "buyer",
  });

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const [errors, setErrors] = useState({});

  // ── Username availability debounce ──
  useEffect(() => {
    if (!formData.username || formData.username.length < 3) {
      setUsernameStatus(null);
      return;
    }
    setUsernameStatus("checking");
    clearTimeout(usernameDebounce.current);
    usernameDebounce.current = setTimeout(async () => {
      try {
        const res = await axios.get(`${API}/check-username?username=${encodeURIComponent(formData.username)}`);
        setUsernameStatus(res.data.available ? "available" : "taken");
      } catch {
        setUsernameStatus(null);
      }
    }, 500);
  }, [formData.username]);

  // ── Resend timer countdown ──
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  // ── Inline validation ──
  const validateForm = () => {
    const errs = {};
    if (!formData.username || formData.username.length < 3)
      errs.username = "Username must be at least 3 characters";
    if (usernameStatus === "taken")
      errs.username = "Username is already taken";
    if (!formData.name.trim())
      errs.name = "Full name is required";
    if (!formData.dob)
      errs.dob = "Date of birth is required";
    if (!formData.email || !formData.email.includes("@"))
      errs.email = "Valid email is required";
    if (!formData.password)
      errs.password = "Password is required";
    else if (!/^(?=.*[a-zA-Z])(?=.*\d).{6,}$/.test(formData.password))
      errs.password = "Must be 6+ chars with letters and numbers";
    return errs;
  };

  // ── STEP 1: Send OTP ──
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setOtpSending(true);
    try {
      await axios.post(`${API}/send-otp`, {
        email: formData.email,
        username: formData.username,
      });
      setStep(2);
      setResendTimer(60);
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP";
      // Map backend field errors
      if (msg.toLowerCase().includes("email")) setErrors({ email: msg });
      else if (msg.toLowerCase().includes("username")) setErrors({ username: msg });
      else setErrors({ form: msg });
    } finally {
      setOtpSending(false);
    }
  };

  // ── OTP digit input handler ──
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs[5].current?.focus();
    }
    e.preventDefault();
  };

  // ── STEP 2: Submit signup with OTP ──
  const handleSignup = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < 6) { setErrors({ otp: "Please enter the full 6-digit OTP" }); return; }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/signup`, {
        ...formData,
        otp: otpString,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Signup failed";
      setErrors({ otp: msg });
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setOtpSending(true);
    setOtp(["", "", "", "", "", ""]);
    try {
      await axios.post(`${API}/send-otp`, { email: formData.email, username: formData.username });
      setResendTimer(60);
      setErrors({});
      otpRefs[0].current?.focus();
    } catch (err) {
      setErrors({ otp: err.response?.data?.message || "Failed to resend OTP" });
    } finally {
      setOtpSending(false);
    }
  };

  const usernameIcon = () => {
    if (usernameStatus === "checking") return <span className="input-group-text bg-white border-start-0"><span className="spinner-border spinner-border-sm text-secondary" /></span>;
    if (usernameStatus === "available") return <span className="input-group-text bg-white border-start-0 text-success fw-bold">✓</span>;
    if (usernameStatus === "taken") return <span className="input-group-text bg-white border-start-0 text-danger fw-bold">✗</span>;
    return null;
  };

  const maxDob = new Date();
  maxDob.setFullYear(maxDob.getFullYear() - 13);
  const maxDobStr = maxDob.toISOString().split("T")[0];

  return (
    <>
      <Navbar />

      <div
        className="min-vh-100 d-flex align-items-center justify-content-center py-5"
        style={{ background: "linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 50%, #0d0d0d 100%)" }}
      >
        <div className="w-100" style={{ maxWidth: "480px", padding: "0 16px" }}>

          {/* Logo / brand */}
          <div className="text-center mb-4">
            <img src="/title.png" alt="GroupBuy" height="48" className="mb-3" />
            <h4 className="text-white fw-bold mb-1">
              {step === 1 ? "Create your account" : "Verify your email"}
            </h4>
            <p className="text-secondary small">
              {step === 1
                ? "Join GroupBuy and start saving together"
                : `We sent a 6-digit code to ${formData.email}`}
            </p>
          </div>

          <div className="card border-0 shadow-lg" style={{ borderRadius: "16px", background: "#1c1c1e" }}>
            <div className="card-body p-4">

              {/* ── STEP 1: Signup Form ── */}
              {step === 1 && (
                <form onSubmit={handleSendOtp} noValidate>

                  {errors.form && (
                    <div className="alert alert-danger py-2 small mb-3">{errors.form}</div>
                  )}

                  {/* Username */}
                  <div className="mb-3">
                    <label className="form-label text-light small fw-semibold">Username</label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark border-end-0 text-secondary border-secondary">@</span>
                      <input
                        type="text"
                        name="username"
                        className={`form-control bg-dark text-white border-secondary border-start-0 ${errors.username ? "is-invalid" : ""}`}
                        placeholder="choose a unique username"
                        value={formData.username}
                        onChange={handleChange}
                        autoComplete="username"
                        style={{ borderRight: usernameStatus ? "none" : undefined }}
                      />
                      {usernameIcon()}
                    </div>
                    {errors.username && <div className="text-danger small mt-1">{errors.username}</div>}
                    {usernameStatus === "available" && !errors.username && (
                      <div className="text-success small mt-1">Username is available!</div>
                    )}
                    {usernameStatus === "taken" && !errors.username && (
                      <div className="text-danger small mt-1">Username is already taken</div>
                    )}
                  </div>

                  {/* Full Name */}
                  <div className="mb-3">
                    <label className="form-label text-light small fw-semibold">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className={`form-control bg-dark text-white border-secondary ${errors.name ? "is-invalid" : ""}`}
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleChange}
                      autoComplete="name"
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>

                  {/* Date of Birth */}
                  <div className="mb-3">
                    <label className="form-label text-light small fw-semibold">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      className={`form-control bg-dark text-white border-secondary ${errors.dob ? "is-invalid" : ""}`}
                      value={formData.dob}
                      onChange={handleChange}
                      max={maxDobStr}
                    />
                    {errors.dob && <div className="invalid-feedback">{errors.dob}</div>}
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label text-light small fw-semibold">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className={`form-control bg-dark text-white border-secondary ${errors.email ? "is-invalid" : ""}`}
                      placeholder="you@gmail.com"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    <div className="text-secondary small mt-1">A verification code will be sent to this address</div>
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label className="form-label text-light small fw-semibold">Password</label>
                    <input
                      type="password"
                      name="password"
                      className={`form-control bg-dark text-white border-secondary ${errors.password ? "is-invalid" : ""}`}
                      placeholder="Mix of letters and numbers"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />
                    {errors.password
                      ? <div className="invalid-feedback">{errors.password}</div>
                      : <div className="text-secondary small mt-1">6+ characters · must include letters and numbers</div>
                    }
                  </div>

                  {/* Role */}
                  <div className="mb-4">
                    <label className="form-label text-light small fw-semibold">I want to</label>
                    <select
                      name="role"
                      className="form-select bg-dark text-white border-secondary"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="buyer">Buy Products</option>
                      <option value="seller">Sell Products</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100 fw-bold py-2"
                    disabled={otpSending || usernameStatus === "taken"}
                    style={{ borderRadius: "10px", fontSize: "15px" }}
                  >
                    {otpSending
                      ? <><span className="spinner-border spinner-border-sm me-2" />Sending OTP…</>
                      : "Send Verification Code"}
                  </button>

                  <p className="text-center text-secondary small mt-3 mb-0">
                    Already have an account?{" "}
                    <Link to="/login" className="text-success text-decoration-none fw-semibold">Sign in</Link>
                  </p>
                </form>
              )}

              {/* ── STEP 2: OTP Entry ── */}
              {step === 2 && (
                <form onSubmit={handleSignup} noValidate>

                  <div className="text-center mb-4">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                      style={{ width: 64, height: 64, background: "#198754", fontSize: 28 }}
                    >
                      ✉️
                    </div>
                    <p className="text-secondary small mb-0">Check your spam folder if you don't see it</p>
                  </div>

                  {/* OTP Boxes */}
                  <div className="d-flex justify-content-center gap-2 mb-2">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={otpRefs[i]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={i === 0 ? handleOtpPaste : undefined}
                        className={`form-control text-center fw-bold fs-4 bg-dark text-white border-secondary ${errors.otp ? "border-danger" : ""}`}
                        style={{ width: "52px", height: "58px", borderRadius: "10px" }}
                      />
                    ))}
                  </div>

                  {errors.otp && (
                    <div className="text-danger small text-center mb-3">{errors.otp}</div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-success w-100 fw-bold py-2 mt-2"
                    disabled={loading}
                    style={{ borderRadius: "10px", fontSize: "15px" }}
                  >
                    {loading
                      ? <><span className="spinner-border spinner-border-sm me-2" />Verifying…</>
                      : "Verify & Create Account"}
                  </button>

                  {/* Resend + Back */}
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <button
                      type="button"
                      className="btn btn-link text-secondary small p-0 text-decoration-none"
                      onClick={() => { setStep(1); setOtp(["","","","","",""]); setErrors({}); }}
                    >
                      ← Change email
                    </button>

                    <button
                      type="button"
                      className={`btn btn-link small p-0 text-decoration-none ${resendTimer > 0 ? "text-secondary" : "text-success"}`}
                      onClick={handleResend}
                      disabled={resendTimer > 0 || otpSending}
                    >
                      {otpSending ? "Sending…" : resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      </div>

      <style>{`
        .form-control.bg-dark::placeholder { color: #6c757d; }
        .form-control.bg-dark:focus { border-color: #198754 !important; box-shadow: 0 0 0 2px rgba(25,135,84,0.25); background: #1c1c1e; color: white; }
        .form-select.bg-dark:focus { border-color: #198754 !important; box-shadow: 0 0 0 2px rgba(25,135,84,0.25); }
        .input-group-text.bg-dark { color: #6c757d; border-color: #6c757d; }
      `}</style>
    </>
  );
}

export default Signup;
