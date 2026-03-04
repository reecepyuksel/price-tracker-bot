const axios = require("axios");
const cheerio = require("cheerio");
const UserAgent = require("user-agents");

function parseTurkishPrice(text) {
  if (!text) return 0;

  let raw = text.replace(/[^\d.,]/g, "").trim();

  if (!raw) return 0;

  if (raw.includes(",")) {
    raw = raw.replace(/\./g, "").replace(",", ".");
  } else {
    const parts = raw.split(".");
    if (parts.length > 1 && parts[parts.length - 1].length <= 2) {
    } else {
      raw = raw.replace(/\./g, "");
    }
  }

  const price = parseFloat(raw);
  return isNaN(price) ? 0 : price;
}

const scrapeProductDetails = async (url) => {
  try {
    const userAgent = new UserAgent({ deviceCategory: "desktop" });

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": userAgent.toString(),
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);

    let priceText = "";

    const selectors = [
      ".a-price-whole",
      "#priceblock_ourprice",
      "#priceblock_dealprice",
      ".prc-dsc",
      ".product-price-container span",
      ".product-new-price",
      ".hermes-SavedPrice",
      ".newPrice ins",
      ".mainPrice",
      ".rc-prices-currentprice",
      ".as-price-currentprice",
      "[class*='price']:not([class*='old']):not([class*='before']):not([class*='old'])",
      ".price",
    ];

    for (const sel of selectors) {
      const el = $(sel).first();
      const text = el.text().trim();
      if (text && /\d/.test(text)) {
        priceText = text;
        break;
      }
    }

    if (!priceText || parseTurkishPrice(priceText) === 0) {
      $("script[type='application/ld+json']").each((_, el) => {
        try {
          const json = JSON.parse($(el).html());
          const findPrice = (obj) => {
            if (!obj) return null;
            if (obj.price) return String(obj.price);
            if (obj.offers) return findPrice(obj.offers);
            if (Array.isArray(obj)) {
              for (const item of obj) {
                const result = findPrice(item);
                if (result) return result;
              }
            }
            return null;
          };
          const found = findPrice(json);
          if (found && parseTurkishPrice(found) > 0) {
            priceText = found;
          }
        } catch (e) {}
      });
    }

    const price = parseTurkishPrice(priceText);

    let imageUrl =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      $(".product-image img, .productImage img").first().attr("src") ||
      $("img").filter((_, el) => {
        const src = $(el).attr("src") || "";
        return src.includes("product") || src.includes("item");
      }).first().attr("src") ||
      $("img").first().attr("src");

    console.log(`✅ [${url.slice(0, 60)}...] → Fiyat: ${price} ₺ | Raw: "${priceText.slice(0, 50)}"`);

    return { price, imageUrl };
  } catch (error) {
    console.error(`❌ Scraping Hatası (${url.slice(0, 60)}):`, error.message);
    return { price: 0, imageUrl: "" };
  }
};

module.exports = { scrapeProductDetails };
