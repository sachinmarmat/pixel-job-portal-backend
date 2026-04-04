const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const cron = require("node-cron");
const User = require('./models/User');
const Employer = require('./models/Employer');

const app = express();

/* -------------------- CORS FIX -------------------- */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://pixel-ui-six.vercel.app"
];

app.use(cors({
  origin: function(origin, callback) {

    // allow requests with no origin (mobile apps / postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS not allowed"));
  },
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// handle preflight requests
app.options("/", cors());

/* -------------------- BODY PARSER -------------------- */

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

/* -------------------- SERVER -------------------- */

const PORT = process.env.PORT || 8080;

connectDB().then(() => {

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

    } catch (error) {
      console.error("Cron job error:", error.message);
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

});