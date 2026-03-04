const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PriceHistory = sequelize.define("PriceHistory", {
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

module.exports = PriceHistory;
