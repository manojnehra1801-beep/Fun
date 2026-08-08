require("dotenv").config();

const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));


// =====================================================
// SUPABASE
// =====================================================

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


// =====================================================
// HOME PAGE
// =====================================================

app.get("/", (req, res) => {

  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );

});


// =====================================================
// CANDIDATE PAGE
// =====================================================

app.get("/candidate.html", (req, res) => {

  res.sendFile(
    path.join(__dirname, "public", "candidate.html")
  );

});


// =====================================================
// ADMIN PAGE
// =====================================================

app.get("/admin.html", (req, res) => {

  res.sendFile(
    path.join(__dirname, "public", "admin.html")
  );

});


// =====================================================
// BASIC API TEST
// =====================================================

app.get("/api", (req, res) => {

  res.json({

    success: true,

    message: "Janmat Survey API is working"

  });

});


// =====================================================
// SUPABASE TEST
// =====================================================

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
        "Supabase test error:",
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

    console.error(error);

    res.status(500).json({

      success: false,

      message: "Supabase test failed",

      error: error.message

    });

  }

});


// =====================================================
// GET POTENTIAL CANDIDATES
// =====================================================

app.get("/api/candidates", async (req, res) => {

  try {

    if (!supabase) {

      return res.status(500).json({

        success: false,

        message: "Supabase configuration is missing"

      });

    }


    const {
      state,
      district,
      village,
      panchayat
    } = req.query;


    if (
      !state ||
      !district ||
      !village ||
      !panchayat
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Location information is required."

      });

    }


    const { data, error } = await supabase

      .from("potential_candidates")

      .select(`
        "Candidate 1",
        "Candidate 2",
        "Candidate 3",
        "Candidate 4"
      `)

      .eq("State", state)

      .eq("District", district)

      .eq("Village", village)

      .eq("Panchayat", panchayat);


    if (error) {

      console.error(
        "Candidate fetch error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Could not load candidates.",

        error: error.message

      });

    }


    // Remove duplicate candidate names

    const candidates = [];


    data.forEach(row => {

      const names = [

        row["Candidate 1"],

        row["Candidate 2"],

        row["Candidate 3"],

        row["Candidate 4"]

      ];


      names.forEach(name => {

        if (
          name &&
          name.trim() &&
          !candidates.includes(name.trim())
        ) {

          candidates.push(
            name.trim()
          );

        }

      });

    });


    res.json({

      success: true,

      candidates: candidates

    });


  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message: "Server error",

      error: error.message

    });

  }

});


// =====================================================
// SAVE POTENTIAL CANDIDATE
// =====================================================

app.post("/api/candidates", async (req, res) => {

  try {

    if (!supabase) {

      return res.status(500).json({

        success: false,

        message:
          "Supabase configuration is missing."

      });

    }


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


    // Required fields

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


    const candidateData = {

      "State":
        state,

      "District":
        district,

      "Village":
        village,

      "Panchayat":
        panchayat,

      "Candidate 1":
        candidate1,

      "Candidate 2":
        candidate2 || null,

      "Candidate 3":
        candidate3 || null,

      "Candidate 4":
        candidate4 || null,

      "Mobile":
        mobile || null,

      "Likely":
        likely,

      "Extra info":
        extraInfo || null

    };


    console.log(
      "Saving candidate:",
      candidateData
    );


    const {
      data,
      error
    } = await supabase

      .from("potential_candidates")

      .insert([candidateData])

      .select();


    if (error) {

      console.error(
        "Supabase insert error:",
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


    console.log(
      "✅ Candidate saved successfully"
    );


    res.status(201).json({

      success: true,

      message:
        "Candidate information saved successfully.",

      data: data

    });


  } catch (error) {

    console.error(
      "Candidate save error:",
      error
    );

    res.status(500).json({

      success: false,

      message: "Server error",

      error: error.message

    });

  }

});


// =====================================================
// ADMIN LOGIN
// =====================================================

app.post("/api/admin/login", (req, res) => {

  try {

    const {
      id,
      password
    } = req.body;


    const adminId =
      process.env.ADMIN_ID;

    const adminPassword =
      process.env.ADMIN_PASSWORD;


    if (
      !adminId ||
      !adminPassword
    ) {

      console.error(
        "❌ ADMIN_ID or ADMIN_PASSWORD is missing"
      );

      return res.status(500).json({

        success: false,

        message:
          "Admin credentials are not configured."

      });

    }


    if (
      id === adminId &&
      password === adminPassword
    ) {

      return res.json({

        success: true,

        message:
          "Login successful"

      });

    }


    return res.status(401).json({

      success: false,

      message:
        "Invalid ID or password"

    });


  } catch (error) {

    console.error(
      "Admin login error:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Server error"

    });

  }

});


// =====================================================
// ADMIN — GET ALL SUBMISSIONS
// =====================================================

app.get("/api/admin/candidates", async (req, res) => {

  try {

    if (!supabase) {

      return res.status(500).json({

        success: false,

        message:
          "Supabase configuration is missing"

      });

    }


    const {
      data,
      error
    } = await supabase

      .from("potential_candidates")

      .select("*")

      .order(
        "Created at",
        {
          ascending: false
        }
      );


    if (error) {

      console.error(
        "Admin fetch error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Could not load submissions.",

        error:
          error.message

      });

    }


    res.json({

      success: true,

      count:
        data.length,

      data:
        data

    });


  } catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message:
        "Server error",

      error:
        error.message

    });

  }

});


// =====================================================
// 404
// =====================================================

app.use((req, res) => {

  res.status(404).json({

    success: false,

    message:
      "Page or API endpoint not found."

  });

});


// =====================================================
// START SERVER
// =====================================================

const PORT =
  process.env.PORT || 10000;


app.listen(
  PORT,
  () => {

    console.log(
      `🚀 Janmat Survey running on port ${PORT}`
    );

  }
);