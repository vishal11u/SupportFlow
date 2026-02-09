const { Sequelize } = require("sequelize");
require("dotenv").config();

const encodedPassword = encodeURIComponent(process.env.POSTGRES_PASSWORD);

const sequelize = new Sequelize(
  `postgres://${process.env.POSTGRES_USER}:${encodedPassword}` +
    `@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}` +
    `/${process.env.POSTGRES_DATABASE}`,
  {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
);

module.exports = sequelize;
