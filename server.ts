import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory data store for Vercel compatibility
// Note: Data will reset on server restart. For persistence on Vercel, use a cloud DB like Supabase or Vercel Postgres.
const store = {
  reports: [
    { id: 1, title: "University Account Verification", content: "Your university email will be deactivated in 24 hours. Verify your account now at: http://uni-verify-portal.com/login", type: "Phishing Scam", risk_level: "High Risk", reports_count: 45, created_at: new Date().toISOString() },
    { id: 2, title: "Remote Data Entry - $500/Day", content: "Work from home! Earn $500/day doing simple data entry. No experience needed. Contact us on WhatsApp at +1-555-0199.", type: "Job Scam", risk_level: "High Risk", reports_count: 120, created_at: new Date().toISOString() },
    { id: 3, title: "Google Summer Internship 2026", content: "Congratulations! You have been selected for a Google Summer Internship. To confirm your spot, please pay a $50 background check fee.", type: "Internship Scam", risk_level: "Critical", reports_count: 89, created_at: new Date().toISOString() },
    { id: 4, title: "Global Merit Scholarship Award", content: "Dear student, you have been awarded a $5,000 scholarship! To claim your funds, please pay a $25 processing fee via Zelle.", type: "Scholarship Scam", risk_level: "Critical", reports_count: 67, created_at: new Date().toISOString() },
    { id: 5, title: "Library Access Renewal Required", content: "Your library access is about to expire. Please log in to the student portal to renew: http://campus-library-auth.net", type: "Phishing Scam", risk_level: "High Risk", reports_count: 34, created_at: new Date().toISOString() },
    { id: 6, title: "Part-time Virtual Assistant", content: "Looking for a student assistant to help with administrative tasks. $30/hour. Send a copy of your ID to start.", type: "Job Scam", risk_level: "High Risk", reports_count: 56, created_at: new Date().toISOString() },
    { id: 7, title: "Tech Startup Internship Opportunity", content: "Join our fast-growing AI startup as an intern. Note: You must purchase your own company-approved laptop from our vendor.", type: "Internship Scam", risk_level: "High Risk", reports_count: 23, created_at: new Date().toISOString() }
  ],
  stats: {
    total_scans: 10,
    detected: 7,
    links_checked: 4
  },
  alerts: [
    { id: 1, title: "New Phishing Wave Targeting .edu", description: "Multiple reports of fake university password reset emails. Do not click links in unexpected emails.", type: "Phishing", date: "2026-02-18", is_new: 1 },
    { id: 2, title: "Fake Internship Offers on LinkedIn", description: "Scammers posing as recruiters from Fortune 500 companies. Verify through official career pages.", type: "Job Scam", date: "2026-02-16", is_new: 1 },
    { id: 3, title: "Gift Card Scam Targeting Students", description: "Professor impersonation emails requesting gift card purchases have increased 300% this month.", type: "Impersonation", date: "2026-02-14", is_new: 1 }
  ]
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/reports", (req, res) => {
    res.json([...store.reports].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  });

  app.post("/api/reports", (req, res) => {
    const { title, content, type, risk_level } = req.body;
    const newReport = {
      id: store.reports.length + 1,
      title,
      content,
      type,
      risk_level,
      reports_count: 1,
      created_at: new Date().toISOString()
    };
    store.reports.push(newReport);
    res.json({ id: newReport.id });
  });

  app.get("/api/alerts", (req, res) => {
    res.json([...store.alerts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  });

  app.get("/api/stats", (req, res) => {
    res.json({ 
      totalScans: store.stats.total_scans, 
      detected: store.stats.detected, 
      linksChecked: store.stats.links_checked, 
      reportsCount: store.reports.length 
    });
  });

  app.post("/api/stats/increment", (req, res) => {
    const { type } = req.body;
    if (type === "scan") {
      store.stats.total_scans++;
    } else if (type === "detected") {
      store.stats.detected++;
    } else if (type === "link") {
      store.stats.links_checked++;
    }
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
