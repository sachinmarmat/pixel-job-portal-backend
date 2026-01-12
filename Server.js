const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const cron = require("node-cron");
const User = require('./models/User');
const Employer = require('./models/Employer');

const app = express();

/* -------------------- CORS -------------------- */
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://pixel-ui-six.vercel.app" 
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------- ROUTES -------------------- */
app.use('/api/auth', require('./routes/authRoute'));
app.use('/api/jobs', require('./routes/jobRoute'));
app.use('/api/user', require('./routes/userRoute'));
app.use('/api/admin', require('./routes/adminRoute'));
app.use('/api/premium', require('./routes/premiumRoute'));
app.use('/api/inform', require('./routes/informRoute'));

app.get('/', (req, res) => {
  res.send('Hello backend is working!');
});

/* -------------------- START SERVER SAFELY -------------------- */
const PORT = process.env.PORT || 8080;

connectDB().then(() => {

  // ✅ Start cron ONLY after DB is connected
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      await User.updateMany(
        { status: "suspended", suspendedUntil: { $lte: now } },
        { status: "active", suspendedUntil: null, suspensionReason: null }
      );

      await Employer.updateMany(
        { status: "suspended", suspendedUntil: { $lte: now } },
        { status: "active", suspendedUntil: null, suspensionReason: null }
      );

      // console.log("Cron job executed successfully");
    } catch (error) {
      console.error("Cron job error:", error.message);
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

});
