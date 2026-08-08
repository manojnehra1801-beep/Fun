const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public folder
app.use(express.static(path.join(__dirname, "public")));

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);


// HOME PAGE
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// CANDIDATE PAGE
app.get("/candidate.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "candidate.html"));
});


// TEST API
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Janmat Survey API is working"
  });
});


// SAVE CANDIDATE INFORMATION
app.post("/api/candidates", async (req, res) => {

  try {

    const {
      state,
      district,
      village,
      panchayat,
      candidate1,
      candidate2,
      candidate3,
      candidate4,
      mobile,
      likely,
      extraInfo
    } = req.body;


    // Data exactly according to Supabase column names
    const candidateData = {

      "State": state,
      "District": district,
      "Village": village,
      "Panchayat": panchayat,

      "Candidate 1": candidate1,
      "Candidate 2": candidate2 || null,
      "Candidate 3": candidate3 || null,
      "Candidate 4": candidate4 || null,

      "Mobile": mobile || null,
      "Likely": likely,
      "Extra info": extraInfo || null
    };


    const { data, error } = await supabase
      .from("potential_candidates")
      .insert([candidateData])
      .select();


    if (error) {

      console.error("SUPABASE ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Could not save candidate information.",
        error: error.message
      });

    }


    res.json({
      success: true,
      message: "Candidate information saved successfully.",
      data: data
    });


  } catch (error) {

    console.error("SERVER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message
    });

  }

});


// PORT
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});