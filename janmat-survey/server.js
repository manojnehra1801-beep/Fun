const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();


// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ===============================
// PUBLIC FOLDER
// ===============================

app.use(express.static(path.join(__dirname, "public")));


// ===============================
// SUPABASE CONFIG
// ===============================

const SUPABASE_URL = process.env.SUPABASE_URL;

const SUPABASE_KEY =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;


if (!SUPABASE_URL) {
  console.error("❌ SUPABASE_URL is missing");
}

if (!SUPABASE_KEY) {
  console.error("❌ SUPABASE KEY is missing");
}


const supabase =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;


// ===============================
// HOME PAGE
// ===============================

app.get("/", (req, res) => {

  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );

});


// ===============================
// CANDIDATE PAGE
// ===============================

app.get("/candidate.html", (req, res) => {

  res.sendFile(
    path.join(__dirname, "public", "candidate.html")
  );

});


// ===============================
// SURVEY PAGE
// ===============================

app.get("/survey.html", (req, res) => {

  res.sendFile(
    path.join(__dirname, "public", "survey.html")
  );

});


// ===============================
// API TEST
// ===============================

app.get("/api", (req, res) => {

  res.json({

    success: true,

    message: "Janmat Survey API is working"

  });

});


// ===============================
// SUPABASE TEST
// ===============================

app.get("/api/test", async (req, res) => {

  try {

    if (!supabase) {

      return res.status(500).json({

        success: false,

        message: "Supabase configuration is missing"

      });

    }


    const { data, error } = await supabase
      .from("potential_candidates")
      .select("*")
      .limit(1);


    if (error) {

      console.error(
        "SUPABASE TEST ERROR:",
        error
      );

      return res.status(500).json({

        success: false,

        message: "Supabase connection failed",

        error: error.message

      });

    }


    res.json({

      success: true,

      message: "Supabase connected successfully",

      data: data

    });


  } catch (error) {

    console.error(
      "SUPABASE TEST ERROR:",
      error
    );


    res.status(500).json({

      success: false,

      message: "Supabase test failed",

      error: error.message

    });

  }

});


// ===============================
// SAVE POTENTIAL CANDIDATE DATA
// ===============================

app.post("/api/candidates", async (req, res) => {

  try {

    if (!supabase) {

      return res.status(500).json({

        success: false,

        message: "Supabase configuration is missing"

      });

    }


    // ===========================
    // GET FORM DATA
    // ===========================

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


    // ===========================
    // REQUIRED CHECK
    // ===========================

    if (

      !state ||

      !district ||

      !village ||

      !panchayat ||

      !candidate1 ||

      !likely

    ) {

      return res.status(400).json({

        success: false,

        message:
          "Please fill all required information."

      });

    }


    // ===========================
    // PREPARE DATA
    // ===========================

    const candidateData = {

      "State": state,

      "District": district,

      "Village": village,

      "Panchayat": panchayat,

      "Candidate 1": candidate1,

      "Candidate 2":
        candidate2 || null,

      "Candidate 3":
        candidate3 || null,

      "Candidate 4":
        candidate4 || null,

      "Mobile":
        mobile || null,

      "Likely": likely,

      "Extra info":
        extraInfo || null

    };


    console.log(
      "Saving candidate:",
      candidateData
    );


    // ===========================
    // INSERT INTO SUPABASE
    // ===========================

    const {

      data,

      error

    } = await supabase

      .from("potential_candidates")

      .insert([candidateData])

      .select();


    // ===========================
    // SUPABASE ERROR
    // ===========================

    if (error) {

      console.error(
        "❌ SUPABASE INSERT ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Could not save candidate information.",

        error:
          error.message

      });

    }


    // ===========================
    // SUCCESS
    // ===========================

    console.log(
      "✅ Candidate saved successfully"
    );


    res.json({

      success: true,

      message:
        "Candidate information saved successfully.",

      data: data

    });


  } catch (error) {

    console.error(
      "❌ SERVER ERROR:",
      error
    );


    res.status(500).json({

      success: false,

      message:
        "Server error occurred.",

      error:
        error.message

    });

  }

});


// ===============================
// 404 HANDLER
// ===============================

app.use((req, res) => {

  res.status(404).json({

    success: false,

    message:
      "Page or API endpoint not found."

  });

});


// ===============================
// START SERVER
// ===============================

const PORT =
  process.env.PORT || 10000;


app.listen(PORT, () => {

  console.log(
    `🚀 Janmat Survey server running on port ${PORT}`
  );

});