require('dotenv').config();
const express = require("express");
const nodemailer = require("nodemailer");

require('dotenv').config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();

// ✅ Enable CORS for your GitHub Pages frontend
app.use(cors({
  origin: ["https://prend0.github.io/System-Lost-And-Found"],
  methods: ["GET", "POST"]
}));

// ✅ Add parsers for form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Created uploads folder:", uploadsDir);
}

// ✅ Serve static files (optional)
app.use(express.static(path.join(__dirname)));

// ✅ Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// ✅ Health check route (for testing server)
app.get("/", (req, res) => {
  res.send("✅ Lost & Found backend is running.");
});

// ✅ Handle report submission
app.post("/send-report", upload.single("image"), async (req, res) => {
  const { founder, place, time, description } = req.body;
  const imageFile = req.file ? req.file.path : null;

  try {
    // ✅ Create mail transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      },
    });

    // ✅ Define email content
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: [
        "macazo.386667@novaliches.sti.edu.ph",
        "acuna.385093@novaliches.sti.edu.ph",
        "melendez.387472@novaliches.sti.edu.ph",
        "sandiego.393481@novaliches.sti.edu.ph",
        "kamimura.405642@novaliches.sti.edu.ph",
        "go.387381@novaliches.sti.edu.ph",
        "nanquilada.388026@novaliches.sti.edu.ph",
        "paner.391196@novaliches.sti.edu.ph",
        "villegas.386021@novaliches.sti.edu.ph",
        "ramos.386137@novaliches.sti.edu.ph"
      ],
      subject: "New Lost and Found Report",
      text: `
        Founder: ${founder}
        Place: ${place}
        Time: ${time}
        Description: ${description}
      `,
      attachments: imageFile ? [{ path: imageFile }] : []
    };

    // ✅ Send the email
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Report sent successfully." });

  } catch (error) {
    console.error("❌ Email sending failed:", error);
    res.status(500).json({ success: false, message: error.toString() });
  }
});

// ✅ Start server (Render will auto-assign PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
