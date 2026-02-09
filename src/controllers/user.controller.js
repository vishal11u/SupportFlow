const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { successResponse, errorResponse } = require("../utils/response.util");

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const { tenantId } = req.user;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(res, "User already exists", 400, "USER_EXISTS");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "USER",
      tenantId,
    });

    // Don't return password
    const userResponse = user.toJSON();
    delete userResponse.password;

    successResponse(res, "User created successfully", userResponse, 201, "USER_CREATED");
  } catch (error) {
    console.error(error);
    errorResponse(res, "Server error", 500, "SERVER_ERROR", error);
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const users = await User.findAll({
      where: { tenantId },
      attributes: { exclude: ["password"] },
    });
    successResponse(res, "Users retrieved successfully", users, 200, "USERS_RETRIEVED");
  } catch (error) {
    errorResponse(res, "Server error", 500, "SERVER_ERROR", error);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;
    const { tenantId } = req.user;

    const user = await User.findOne({ where: { id, tenantId } });
    if (!user) {
      return errorResponse(res, "User not found", 404, "USER_NOT_FOUND");
    }

    // Basic updates
    if (name) user.name = name;
    if (role) user.role = role;

    await user.save();
    
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    successResponse(res, "User updated successfully", userResponse, 200, "USER_UPDATED");
  } catch (error) {
    errorResponse(res, "Server error", 500, "SERVER_ERROR", error);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;

    const user = await User.findOne({ where: { id, tenantId } });
    if (!user) {
      return errorResponse(res, "User not found", 404, "USER_NOT_FOUND");
    }

    // Soft delete
    await user.destroy();
    successResponse(res, "User deleted successfully", null, 200, "USER_DELETED");
  } catch (error) {
    errorResponse(res, "Server error", 500, "SERVER_ERROR", error);
  }
};
