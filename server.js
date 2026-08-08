require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const Survey = require("./models/Survey");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));


// =============================
// DATABASE
// =============================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });


// =============================
// HOME
// =============================

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// =============================
// SUBMIT SURVEY
// =============================

app.post("/api/survey", async (req, res) => {
  try {
    const {
      ageGroup,
      gender,
      state,
      district,
      constituency,
      area,
      importantIssue,
      preferredParty,
      candidateChoice,
      votingLikelihood
    } = req.body;

    if (
      !ageGroup ||
      !state ||
      !district ||
      !constituency ||
      !importantIssue ||
      !preferredParty ||
      !candidateChoice ||
      !votingLikelihood
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields."
      });
    }

    const survey = new Survey({
      ageGroup,
      gender,
      state,
      district,
      constituency,
      area,
      importantIssue,
      preferredParty,
      candidateChoice,
      votingLikelihood
    });

    await survey.save();

    res.json({
      success: true,
      message: "Your response has been submitted successfully."
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
});


// =============================
// TOTAL RESPONSES
// =============================

app.get("/api/results", async (req, res) => {
  try {
    const surveys = await Survey.find();

    const total = surveys.length;

    const partyResults = {};

    surveys.forEach((survey) => {
      const party = survey.preferredParty;

      if (!partyResults[party]) {
        partyResults[party] = 0;
      }

      partyResults[party]++;
    });


    const issueResults = {};

    surveys.forEach((survey) => {
      const issue = survey.importantIssue;

      if (!issueResults[issue]) {
        issueResults[issue] = 0;
      }

      issueResults[issue]++;
    });


    const candidateResults = {};

    surveys.forEach((survey) => {
      const candidate = survey.candidateChoice;

      if (!candidateResults[candidate]) {
        candidateResults[candidate] = 0;
      }

      candidateResults[candidate]++;
    });


    res.json({
      success: true,
      total,
      partyResults,
      issueResults,
      candidateResults
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to load results."
    });
  }
});


// =============================
// ADMIN LOGIN
// =============================

app.post("/api/admin/login", (req, res) => {

  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {

    return res.json({
      success: true,
      message: "Login successful"
    });

  }

  res.status(401).json({
    success: false,
    message: "Invalid password"
  });

});


// =============================
// ADMIN DATA
// =============================

app.get("/api/admin/surveys", async (req, res) => {

  try {

    const password = req.headers["admin-password"];

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const surveys = await Survey.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      surveys
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

});


// =============================
// SERVER
// =============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});