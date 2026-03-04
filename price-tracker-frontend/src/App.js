import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  TrendingDown,
  PlusCircle,
  ExternalLink,
  Activity,
  Zap,
  Trash2,
} from "lucide-react";
import { LineChart, Line, Tooltip, ResponsiveContainer, YAxis, XAxis } from "recharts";

function App() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("http://localhost:3000/api/products");
      setProducts(data);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name || !url) return;
    await axios.post("http://localhost:3000/api/products", { name, url });
    setName("");
    setUrl("");
    fetchProducts();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu ürünü takipten çıkarmak istediğinize emin misiniz?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Silme hatası:", error);
    }
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={logoArea}>
          <div style={iconCircle}>
            <Zap size={24} color="#fff" fill="#fff" />
          </div>
          <div>
            <h1 style={mainTitle}>Zenith</h1>
            <p style={subTitle}>Gerçek zamanlı piyasa takip asistanı</p>
          </div>
        </div>
        <div style={statsArea}>
          <div style={statItem}>
            <span style={statLabel}>Takip Edilen</span>
            <span style={statValue}>{products.length} Ürün</span>
          </div>
        </div>
      </header>

      <section style={formSection}>
        <form onSubmit={handleAdd} style={glassForm}>
          <div style={inputGroup}>
            <Activity size={18} color="#00b894" style={inputIcon} />
            <input
              placeholder="Ürün Adı"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={modernInput}
            />
          </div>
          <div style={{ ...inputGroup, flex: 2 }}>
            <ExternalLink size={18} color="#00b894" style={inputIcon} />
            <input
              placeholder="Ürün URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={modernInput}
            />
          </div>
          <button type="submit" style={glowButton}>
            <PlusCircle size={20} /> Takibe Başla
          </button>
        </form>
      </section>

      <main style={gridStyle}>
        {products.map((p) => {
          const history = p.history || [];
          const chartData = history.map((h) => ({
            ...h,
            timeLabel: h.createdAt
              ? new Date(h.createdAt).toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Şimdi",
          }));

          const lastPrice = history.length > 0 ? history[history.length - 1].price : null;
          const prevPrice = history.length > 1 ? history[history.length - 2].price : null;

          let statusEl;
          if (history.length < 2) {
            statusEl = (
              <span style={{ color: "#636e72", display: "flex", alignItems: "center", gap: "4px" }}>
                <Activity size={14} /> Analiz Ediliyor
              </span>
            );
          } else if (lastPrice < prevPrice) {
            statusEl = (
              <span style={{ color: "#00b894", display: "flex", alignItems: "center", gap: "4px" }}>
                <TrendingDown size={14} /> Fırsat: Düşüşte
              </span>
            );
          } else if (lastPrice > prevPrice) {
            statusEl = (
              <span style={{ color: "#ff7675", display: "flex", alignItems: "center", gap: "4px" }}>
                <Activity size={14} style={{ transform: "rotate(180deg)" }} /> Yükselişte
              </span>
            );
          } else {
            statusEl = (
              <span style={{ color: "#636e72", display: "flex", alignItems: "center", gap: "4px" }}>
                <TrendingDown size={14} style={{ opacity: 0.5 }} /> Stabil
              </span>
            );
          }

          return (
            <div key={p.id} style={glassCard}>
              <div style={cardHeader}>
                <div style={headerLeft}>
                  {p.imageUrl && (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      style={{ width: "42px", height: "42px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 }}
                    />
                  )}
                  <h3 style={productName}>{p.name}</h3>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={liveBadge}>
                    <span style={pulsePoint}></span> CANLI
                  </div>
                  <button
                    onClick={() => handleDelete(p.id)}
                    style={deleteBtnStyle}
                    title="Ürünü Sil"
                  >
                    <Trash2 size={16} color="#ff7675" />
                  </button>
                </div>
              </div>

              <div style={priceContainer}>
                <div style={priceLabel}>
                  ₺ Güncel Fiyat
                </div>
                <div style={priceValue}>
                  {p.lastPrice?.toLocaleString("tr-TR")} ₺
                </div>
              </div>

              <div style={chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis hide dataKey="timeLabel" />
                    <YAxis hide domain={["auto", "auto"]} />
                    <Tooltip
                      labelFormatter={(label) => `Saat: ${label || "Belirsiz"}`}
                      contentStyle={tooltipStyle}
                      itemStyle={{ fontWeight: "bold" }}
                      formatter={(val) => [`${Number(val).toLocaleString("tr-TR")} ₺`, "Fiyat"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      name="Fiyat"
                      stroke="#00b894"
                      strokeWidth={4}
                      dot={{ r: 4, fill: "#00b894", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={cardFooter}>
                <a href={p.url} target="_blank" rel="noreferrer" style={actionLink}>
                  Mağazaya Git
                </a>
                <div style={statusText}>{statusEl}</div>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}

const containerStyle = {
  padding: "40px 80px",
  backgroundColor: "#f8f9fa",
  minHeight: "100vh",
  fontFamily: "'Inter', sans-serif",
};
const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "50px",
};
const logoArea = { display: "flex", alignItems: "center", gap: "15px" };
const iconCircle = {
  backgroundColor: "#00b894",
  padding: "12px",
  borderRadius: "16px",
  boxShadow: "0 10px 20px rgba(0,184,148,0.3)",
};
const mainTitle = { fontSize: "28px", fontWeight: "800", margin: 0, color: "#2d3436" };
const subTitle = { fontSize: "14px", color: "#636e72", margin: 0 };
const statsArea = {
  backgroundColor: "#fff",
  padding: "10px 20px",
  borderRadius: "12px",
  border: "1px solid #eee",
};
const statItem = { display: "flex", flexDirection: "column" };
const statLabel = { fontSize: "11px", color: "#b2bec3", fontWeight: "bold", textTransform: "uppercase" };
const statValue = { fontSize: "16px", fontWeight: "bold", color: "#2d3436" };
const formSection = { marginBottom: "40px" };
const glassForm = {
  display: "flex",
  gap: "15px",
  background: "#fff",
  padding: "20px",
  borderRadius: "20px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
};
const inputGroup = { position: "relative", flex: 1 };
const inputIcon = { position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)" };
const modernInput = {
  width: "100%",
  padding: "15px 15px 15px 45px",
  borderRadius: "12px",
  border: "1px solid #e0e0e0",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};
const glowButton = {
  padding: "0 30px",
  backgroundColor: "#2d3436",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontWeight: "bold",
};
const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
  gap: "30px",
};
const glassCard = {
  background: "#fff",
  padding: "30px",
  borderRadius: "24px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
  border: "1px solid #f1f2f6",
};
const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "20px",
};
const headerLeft = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flex: 1,
  marginRight: "10px",
};
const productName = { margin: 0, color: "#2d3436", fontSize: "18px", fontWeight: "700" };
const liveBadge = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "10px",
  fontWeight: "800",
  color: "#00b894",
  padding: "4px 10px",
  backgroundColor: "rgba(0,184,148,0.1)",
  borderRadius: "20px",
  whiteSpace: "nowrap",
};
const pulsePoint = {
  width: "6px",
  height: "6px",
  backgroundColor: "#00b894",
  borderRadius: "50%",
  display: "inline-block",
};
const deleteBtnStyle = {
  background: "rgba(255,118,117,0.08)",
  border: "none",
  cursor: "pointer",
  padding: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "8px",
};
const priceContainer = { marginBottom: "25px" };
const priceLabel = {
  fontSize: "12px",
  color: "#b2bec3",
  fontWeight: "bold",
  marginBottom: "5px",
  display: "flex",
  alignItems: "center",
  gap: "4px",
};
const priceValue = { fontSize: "32px", fontWeight: "900", color: "#2d3436" };
const chartWrapper = { height: "120px", margin: "0 -10px 20px -10px" };
const tooltipStyle = {
  borderRadius: "12px",
  border: "none",
  boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
};
const cardFooter = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderTop: "1px solid #f1f2f6",
  paddingTop: "20px",
};
const actionLink = {
  color: "#0984e3",
  fontSize: "13px",
  fontWeight: "700",
  textDecoration: "none",
  padding: "8px 15px",
  backgroundColor: "rgba(9, 132, 227, 0.05)",
  borderRadius: "8px",
};
const statusText = {
  color: "#636e72",
  fontSize: "13px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  gap: "4px",
};

export default App;
