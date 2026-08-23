const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const accountsRoutes = require("./routes/accountsRoutes");
const contactsRoutes = require("./routes/contactsRoutes");
const opportunitiesRoutes = require("./routes/opportunitiesRoutes");
const leadsRoutes = require("./routes/leadsRoutes");
const activitiesRoutes = require("./routes/activitiesRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

//my api routes
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountsRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/opportunities", opportunitiesRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/activities", activitiesRoutes);

// displaying errors
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
