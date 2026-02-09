const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Tenant, User, sequelize } = require("../models");
const { successResponse, errorResponse } = require("../utils/response.util");

exports.registerTenant = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { tenantName, adminName, adminEmail, adminPassword } = req.body;

    // Check if tenant exists
    const existingTenant = await Tenant.findOne({
      where: { name: tenantName },
    });
    if (existingTenant) {
      await transaction.rollback();
      return errorResponse(res, "Tenant already exists", 400, "TENANT_EXISTS");
    }

    // Check if user exists (globally unique emails? or per tenant? Model says unique: true, so globally)
    const existingUser = await User.findOne({ where: { email: adminEmail } });
    if (existingUser) {
      await transaction.rollback();
      return errorResponse(
        res,
        "User email already exists",
        400,
        "USER_EXISTS",
      );
    }

    // Create Tenant
    const tenant = await Tenant.create({ name: tenantName }, { transaction });

    // Hash Password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create Admin User
    const user = await User.create(
      {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        tenantId: tenant.id,
      },
      { transaction },
    );

    await transaction.commit();

    successResponse(
      res,
      "Tenant and Admin created successfully",
      {
        tenantId: tenant.id,
        adminId: user.id,
      },
      201,
      "TENANT_CREATED",
    );
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    errorResponse(
      res,
      "Server error during registration",
      500,
      "SERVER_ERROR",
      error,
    );
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return errorResponse(
        res,
        "Invalid credentials",
        401,
        "AUTH_INVALID_CREDENTIALS",
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(
        res,
        "Invalid credentials",
        401,
        "AUTH_INVALID_CREDENTIALS",
      );
    }

    const secret = process.env.JWT_SECRET || "default_secret_please_change";
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
      secret,
      { expiresIn: "1d" },
    );

    successResponse(
      res,
      "Login successful",
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
        },
      },
      200,
      "LOGIN_SUCCESS",
    );
  } catch (error) {
    console.error(error);
    errorResponse(res, "Server error", 500, "SERVER_ERROR", error);
  }
};
