require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const {
  createClient
} = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ============================================
// SUPABASE
// ============================================

const SUPABASE_URL =
  process.env.SUPABASE_URL;

const SUPABASE_KEY =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_KEY;

let supabase = null;

if (
  SUPABASE_URL &&
  SUPABASE_KEY
) {

  supabase =
    createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

  console.log("✅ Supabase configured");

} else {

  console.log(
    "⚠️ Supabase environment variables are missing"
  );

}


// ============================================
// HEALTH CHECK
// ============================================

app.get("/api/health", (req, res) => {

  res.json({

    success: true,

    message:
      "Rajasthan Govt Vacancies API is working"

  });

});


// ============================================
// ADMIN LOGIN
// ============================================

app.post(
  "/api/admin/login",
  (req, res) => {

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
        "Invalid Admin ID or Password"

    });

  }
);


// ============================================
// ADD VACANCY
// ============================================

app.post(
  "/api/vacancies",
  async (req, res) => {

    try {

      if (!supabase) {

        return res.status(500).json({

          success: false,

          message:
            "Supabase configuration is missing."

        });

      }


      const {

        title,
        department,
        total_posts,
        qualification,
        age_limit,
        salary,
        start_date,
        last_date,
        job_type,
        notification_link,
        apply_link,
        description

      } = req.body;


      if (!title) {

        return res.status(400).json({

          success: false,

          message:
            "Job title is required."

        });

      }


      const vacancy = {

        title:
          title.trim(),

        department:
          department || null,

        total_posts:
          total_posts || null,

        qualification:
          qualification || null,

        age_limit:
          age_limit || null,

        salary:
          salary || null,

        start_date:
          start_date || null,

        last_date:
          last_date || null,

        job_type:
          job_type || null,

        notification_link:
          notification_link || null,

        apply_link:
          apply_link || null,

        description:
          description || null

      };


      const {
        data,
        error
      } = await supabase

        .from("vacancies")

        .insert([vacancy])

        .select();


      if (error) {

        console.error(
          "Vacancy insert error:",
          error
        );

        return res.status(500).json({

          success: false,

          message:
            "Vacancy could not be saved.",

          error:
            error.message

        });

      }


      res.status(201).json({

        success: true,

        message:
          "Vacancy published successfully.",

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

  }
);


// ============================================
// GET VACANCIES
// ============================================

app.get(
  "/api/vacancies",
  async (req, res) => {

    try {

      if (!supabase) {

        return res.status(500).json({

          success: false,

          message:
            "Supabase configuration is missing."

        });

      }


      const {
        data,
        error
      } = await supabase

        .from("vacancies")

        .select("*")

        .order(
          "created_at",
          {
            ascending: false
          }
        );


      if (error) {

        console.error(
          "Vacancy fetch error:",
          error
        );

        return res.status(500).json({

          success: false,

          message:
            "Could not load vacancies.",

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

      res.status(500).json({

        success: false,

        message:
          "Server error",

        error:
          error.message

      });

    }

  }
);


// ============================================
// SERVE PUBLIC FILES
// ============================================

app.use(
  express.static(
    path.join(
      __dirname,
      "public"
    )
  )
);


// ============================================
// START SERVER
// ============================================

const PORT =
  process.env.PORT || 10000;


app.listen(
  PORT,
  () => {

    console.log(
      `🚀 Server running on port ${PORT}`
    );

  }
);