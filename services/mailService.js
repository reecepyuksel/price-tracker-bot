const nodemailer = require("nodemailer");
const sendPriceAlert = async (userEmail, productName, oldPrice, newPrice) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `🔥 Fırsat: ${productName} Fiyatı Düştü!`,
      html: `
        <h1>Müjde! Beklediğin ürünün fiyatı düştü.</h1>
        <p><strong>${productName}</strong> ürününde fiyat değişimi:</p>
        <p><del>${oldPrice} TL</del> yerine şimdi sadece <b>${newPrice} TL</b>!</p>
        <br>
        <p>Hemen kontrol etmek için siteyi ziyaret et.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Mail başarıyla gönderildi: ${userEmail}`);
  } catch (error) {
    console.error("Mail gönderme hatası:", error);
  }
};

module.exports = { sendPriceAlert };
