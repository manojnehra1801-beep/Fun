require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const Survey = require("./models/Survey");

const app = express();


// ==============================
// MIDDLEWARE
// ==============================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));


// ==============================
// STATIC FILES
// ==============================

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);


// ==============================
// MONGODB
// ==============================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error(
      "MongoDB connection error:",
      error.message
    );
  });


// ==============================
// HOME
// ==============================

app.get("/", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "public",
      "index.html"
    )
  );

});


// ==============================
// SUBMIT SURVEY
// ==============================

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

      gender: gender || "Prefer not to say",

      state,

      district,

      constituency,

      area: area || "",

      importantIssue,

      preferredParty,

      candidateChoice,

      votingLikelihood

    });


    await survey.save();


    res.status(201).json({

      success: true,

      message: "Survey submitted successfully."

    });


  } catch (error) {

    console.error(
      "Survey submission error:",
      error
    );

    res.status(500).json({

      success: false,

      message: "Unable to submit survey."

    });

  }

});


// ==============================
// RESULTS
// ==============================

app.get("/api/results", async (req, res) => {

  try {

    const surveys = await Survey.find();

    const total = surveys.length;

    const partyResults = {};
    const candidateResults = {};
    const issueResults = {};


    surveys.forEach((survey) => {

      const party = survey.preferredParty;

      if (!partyResults[party]) {
        partyResults[party] = 0;
      }

      partyResults[party]++;


      const candidate = survey.candidateChoice;

      if (!candidateResults[candidate]) {
        candidateResults[candidate] = 0;
      }

      candidateResults[candidate]++;


      const issue = survey.importantIssue;

      if (!issueResults[issue]) {
        issueResults[issue] = 0;
      }

      issueResults[issue]++;

    });


    res.json({

      success: true,

      total,

      partyResults,

      candidateResults,

      issueResults

    });


  } catch (error) {

    console.error(
      "Results error:",
      error
    );

    res.status(500).json({

      success: false,

      message: "Unable to load results."

    });

  }

});


// ==============================
// HEALTH CHECK
// ==============================

app.get("/api/health", (req, res) => {

  res.json({

    success: true,

    message: "Janmat Survey server is running."

  });

});


// ==============================
// 404
// ==============================

app.use((req, res) => {

  res.status(404).json({

    success: false,

    message: "Page or API endpoint not found."

  });

});


// ==============================
// START SERVER
// ==============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});