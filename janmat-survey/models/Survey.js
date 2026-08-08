const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema(
  {
    ageGroup: {
      type: String,
      required: true
    },

    gender: {
      type: String,
      default: "Prefer not to say"
    },

    state: {
      type: String,
      required: true
    },

    district: {
      type: String,
      required: true
    },

    constituency: {
      type: String,
      required: true
    },

    area: {
      type: String,
      default: ""
    },

    importantIssue: {
      type: String,
      required: true
    },

    preferredParty: {
      type: String,
      required: true
    },

    candidateChoice: {
      type: String,
      required: true
    },

    votingLikelihood: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Survey", surveySchema);