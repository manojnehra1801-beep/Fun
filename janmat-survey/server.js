require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const Survey = require("./models/Survey");

const app = express();


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));


// ===============================
// STATIC FILES
// ===============================

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);


// ===============================
// MONGODB CONNECTION
// ===============================

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


// ===============================
// HOME PAGE
// ===============================

app.get("/", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "public",
      "index.html"
    )
  );

});


// ===============================
// SUBMIT SURVEY
// ===============================

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


    // Required fields check

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

        message:
          "Please fill all required fields."

      });

    }


    // Create survey

    const survey = new Survey({

      ageGroup,

      gender:
        gender || "Prefer not to say",

      state,

      district,

      constituency,

      area:
        area || "",

      importantIssue,

      preferredParty,

      candidateChoice,

      votingLikelihood

    });


    // Save

    await survey.save();


    res.status(201).json({

      success: true,

      message:
        "Survey submitted successfully."

    });


  } catch (error) {

    console.error(
      "Survey submission error:",
      error
    );


    res.status(500).json({

      success: false,

      message:
        "Unable to submit survey."

    });

  }

});


// ===============================
// GET SURVEY RESULTS
// ===============================

app.get("/api/results", async (req, res) => {

  try {

    const surveys =
      await Survey.find();


    const total =
      surveys.length;


    // ===========================
    // PARTY RESULTS
    // ===========================

    const partyResults