const express = require("express");
const router = express.Router();
const {
  getAdminDashboard,
  getAllUsers,
  deleteUser,
} = require("../controllers/adminController");
const authMiddleware =
  require("../middleware/authMiddleware");
const adminMiddleware =
  require("../middleware/adminMiddleware");

router.get(
  "/dashboard",
  authMiddleware,
  adminMiddleware,
  getAdminDashboard
);

router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  getAllUsers
);

router.delete(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  deleteUser
);

module.exports = router;