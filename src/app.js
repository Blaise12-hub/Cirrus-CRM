import express from "express";
import cors from "cors";
import "dotenv/config";

//import routes
import authRoutes from "./routes/authRoutes.js";
import accountsRoutes from "./routes/accountsRoutes.js";
import contactsRoutes from "./routes/contactsRoutes.js";
import opportunitiesRoutes from "./routes/opportunitiesRoutes.js";
import leadsRoutes from "./routes/leadsRoutes.js";
import activitiesRoutes from "./routes/activitiesRoutes.js";  


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

export default app;

