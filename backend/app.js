const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const settingsRoutes = require("./routes/settingRoutes");
const path = require("path");
const brandRoutes = require("./routes/brands");
const aboutRoutes = require("./routes/aboutRoutes");

const app = express();
// const brandRoutes = require("./routes/brands");

const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// respond to preflight requests
app.options('*', cors());

app.use(bodyParser.json({ limit: "100kb" })); // allow larger metadata

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// API routes
app.use("/api/settings", settingsRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/about", aboutRoutes); // ✅ ADD THIS
// Stores
app.use('/api/stores', require('./routes/storeRoutes'));

// (Optional) serve uploaded images folder or static frontend -- adjust as needed
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
