const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

// JDoodle API credentials from environment variables
const JDoodleClientId = process.env.JDOODLE_CLIENT_ID;
const JDoodleClientSecret = process.env.JDOODLE_CLIENT_SECRET;

// Supported languages and versions (you can extend this list)
const languages = {
  javascript: { language: "nodejs", version: "4" },
  python: { language: "python3", version: "4" },
  java: { language: "java", version: "4" },
  cpp: { language: "cpp", version: "5" },
  c: { language: "c", version: "5" },
  php: { language: "php", version: "4" }
};

// Compile code
router.post("/run", async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language || !languages[language]) {
    return res.status(400).json({ message: "Invalid code or language" });
  }

  const { language: lang, version } = languages[language];

  try {
    const response = await axios.post("https://api.jdoodle.com/v1/execute", {
      clientId: JDoodleClientId,
      clientSecret: JDoodleClientSecret,
      script: code,
      language: lang,
      versionIndex: version,
    });

    res.json({
      output: response.data.output,
      memory: response.data.memory,
      cpuTime: response.data.cpuTime,
    });
  } catch (error) {
    console.error("JDoodle API error:", error);
    res.status(500).json({ message: "Code execution failed", error: error.message });
  }
});

module.exports = router;
