const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const db = {};
db.sequelize = sequelize;
db.Sequelize = require("sequelize");

db.Tenant = require("./tenant.model")(sequelize, DataTypes);
db.User = require("./user.model")(sequelize, DataTypes);
db.Ticket = require("./ticket.model")(sequelize, DataTypes);
db.Notification = require("./notification.model")(sequelize, DataTypes);

// Associations

// Tenant hasMany Users
db.Tenant.hasMany(db.User, { foreignKey: "tenantId", as: "users" });
db.User.belongsTo(db.Tenant, { foreignKey: "tenantId", as: "tenant" });

// Tenant hasMany Tickets
db.Tenant.hasMany(db.Ticket, { foreignKey: "tenantId", as: "tickets" });
db.Ticket.belongsTo(db.Tenant, { foreignKey: "tenantId", as: "tenant" });

// User (Creator) hasMany Tickets
db.User.hasMany(db.Ticket, { foreignKey: "createdById", as: "createdTickets" });
db.Ticket.belongsTo(db.User, { foreignKey: "createdById", as: "creator" });

// User (Assignee) hasMany Tickets
db.User.hasMany(db.Ticket, {
  foreignKey: "assignedToId",
  as: "assignedTickets",
});
db.Ticket.belongsTo(db.User, { foreignKey: "assignedToId", as: "assignee" });

// Tenant hasMany Notifications
db.Tenant.hasMany(db.Notification, {
  foreignKey: "tenantId",
  as: "notifications",
});
db.Notification.belongsTo(db.Tenant, { foreignKey: "tenantId", as: "tenant" });

// User hasMany Notifications
db.User.hasMany(db.Notification, {
  foreignKey: "recipientId",
  as: "notifications",
});
db.Notification.belongsTo(db.User, {
  foreignKey: "recipientId",
  as: "recipient",
});

module.exports = db;
