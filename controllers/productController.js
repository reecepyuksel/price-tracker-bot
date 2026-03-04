const Product = require("../models/Product");
const PriceHistory = require("../models/PriceHistory");
const { scrapeProductDetails } = require("../services/scraperServices");

exports.createProduct = async (req, res) => {
  try {
    const { name, url } = req.body;
    const { price, imageUrl } = await scrapeProductDetails(url);

    const product = await Product.create({
      name,
      url,
      imageUrl,
      lastPrice: price || 0,
    });

    await PriceHistory.create({
      productId: product.id,
      price: price || 0,
    });

    res.status(201).json({
      message: "Ürün eklendi!",
      product,
    });
  } catch (error) {
    res.status(500).json({ error: "Hata oluştu." });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: PriceHistory, as: "history" }],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Veriler çekilemedi." });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await PriceHistory.destroy({ where: { productId: id } });
    await Product.destroy({ where: { id } });
    res.json({ message: "Ürün silindi." });
  } catch (error) {
    res.status(500).json({ error: "Silme işlemi başarısız oldu." });
  }
};
