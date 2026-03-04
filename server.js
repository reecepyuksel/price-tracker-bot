const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const cron = require("node-cron");
const { scrapeProductDetails } = require("./services/scraperServices");
const Product = require("./models/Product");
const PriceHistory = require("./models/PriceHistory");

const app = express();
app.use(cors());
app.use(express.json());

Product.hasMany(PriceHistory, { foreignKey: "productId", as: "history" });
PriceHistory.belongsTo(Product, { foreignKey: "productId" });

app.use("/api/products", productRoutes);

cron.schedule("* * * * *", async () => {
  console.log("🔍 Kontrol yapılıyor...");
  const products = await Product.findAll();

  for (let p of products) {
    const { price } = await scrapeProductDetails(p.url);
    if (price && price > 0) {
      await PriceHistory.create({ productId: p.id, price: price });

      p.lastPrice = price;
      await p.save();
    }
  }
});

sequelize.sync({ alter: true }).then(() => {
  app.listen(3000, () => console.log("🚀 Sunucu 3000'de hazır!"));
});
