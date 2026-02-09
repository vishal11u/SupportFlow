const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const tenantMiddleware = require("../middleware/tenant.middleware");

// Apply middleware to all user routes
router.use(authMiddleware, tenantMiddleware, roleMiddleware(["ADMIN"]));

router.post("/", userController.createUser);
router.get("/", userController.getUsers);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
