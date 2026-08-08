require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const { createClient } = require("@supabase/supabase-js");

const app = express();


// ======================================================
// BASIC SETTINGS
// ======================================================

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);


// ======================================================
// SUPABASE
// ======================================================

const SUPABASE_URL =
  process.env.SUPABASE_URL;

const SUPABASE_KEY =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (SUPABASE_URL && SUPABASE_KEY) {

  supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

  console.log("✅ Supabase configured");

} else {

  console.log(
    "⚠️ Supabase configuration is missing"
  );

}


// ======================================================
// HOMEPAGE
// ======================================================

app.get("/", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "public",
      "index.html"
    )
  );

});


// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/api/health", (req, res) => {

  res.json({

    success: true,

    message:
      "Rajasthan Govt Vacancies API is working"

  });

});


// ======================================================
// ADMIN LOGIN - GET TEST
// ======================================================

app.get(
  "/api/admin/login",
  (req, res) => {

    res.json({

      success: true,

      message:
        "Admin login API is available. Use POST request."

    });

  }
);


// ======================================================
// ADMIN LOGIN - POST
// ======================================================

app.post(
  "/api/admin/login",
  (req, res) => {

    try {

      const id =
        String(
          req.body.id || ""
        ).trim();

      const password =
        String(
          req.body.password || ""
        );


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
            "Admin credentials are not configured on server."

        });

      }


      if (
        id === adminId &&
        password === adminPassword
      ) {

        console.log(
          "✅ Admin login successful"
        );


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


    } catch (error) {

      console.error(
        "Admin login error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Server error"

      });

    }

  }
);


// ======================================================
// ADMIN - GET CANDIDATE DATA
// ======================================================

app.get(
  "/api/admin/candidates",
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

        .from("submissions")

        .select("*")

        .order(
          "created_at",
          {
            ascending: false
          }
        );


      if (error) {

        console.error(
          "Candidates error:",
          error
        );


        return res.status(500).json({

          success: false,

          message:
            "Could not load candidate data.",

          error:
            error.message

        });

      }


      return res.json({

        success: true,

        count:
          data.length,

        data:
          data

      });


    } catch (error) {

      console.error(
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Server error",

        error:
          error.message

      });

    }

  }
);


// ======================================================
// SAVE SURVEY / CANDIDATE DATA
// ======================================================

app.post(
  "/api/submissions",
  async (req, res) => {

    try {

      if (!supabase) {

        return res.status(500).json({

          success: false,

          message:
            "Supabase configuration is missing."

        });

      }


      const submission =
        req.body;


      const {
        data,
        error
      } = await supabase

        .from("submissions")

        .insert([
          submission
        ])

        .select();


      if (error) {

        console.error(
          "Submission error:",
          error
        );


        return res.status(500).json({

          success: false,

          message:
            "Data could not be saved.",

          error:
            error.message

        });

      }


      return res.status(201).json({

        success: true,

        message:
          "Data saved successfully.",

        data:
          data

      });


    } catch (error) {

      console.error(
        "Submission API error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Server error",

        error:
          error.message

      });

    }

  }
);


// ======================================================
// GET VACANCIES
// ======================================================

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
          "Vacancies error:",
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


      return res.json({

        success: true,

        count:
          data.length,

        data:
          data

      });


    } catch (error) {

      console.error(
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Server error",

        error:
          error.message

      });

    }

  }
);


// ======================================================
// ADD VACANCY
// ======================================================

async function addVacancy(req, res) {

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


    if (!title || !title.trim()) {

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

      .insert([
        vacancy
      ])

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


    console.log(
      "✅ Vacancy added successfully"
    );


    return res.status(201).json({

      success: true,

      message:
        "Vacancy published successfully.",

      data:
        data

    });


  } catch (error) {

    console.error(
      "Vacancy API error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Server error",

      error:
        error.message

    });

  }

}


// ======================================================
// ADD VACANCY - NORMAL API
// ======================================================

app.post(
  "/api/vacancies",
  addVacancy
);


// ======================================================
// ADD VACANCY - ADMIN API
// ======================================================

app.post(
  "/api/admin/vacancies",
  addVacancy
);


// ======================================================
// ADMIN - GET VACANCIES
// ======================================================

app.get(
  "/api/admin/vacancies",
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

        return res.status(500).json({

          success: false,

          message:
            "Could not load vacancies.",

          error:
            error.message

        });

      }


      return res.json({

        success: true,

        count:
          data.length,

        data:
          data

      });


    } catch (error) {

      console.error(
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Server error",

        error:
          error.message

      });

    }

  }
);


// ======================================================
// SERVE PUBLIC FOLDER
// ======================================================

app.use(
  express.static(
    path.join(
      __dirname,
      "public"
    )
  )
);


// ======================================================
// 404
// ======================================================

app.use(
  (req, res) => {

    res.status(404).json({

      success: false,

      message:
        "Route not found",

      path:
        req.originalUrl

    });

  }
);


// ======================================================
// ERROR HANDLER
// ======================================================

app.use(
  (error, req, res, next) => {

    console.error(
      "Server error:",
      error
    );


    res.status(500).json({

      success: false,

      message:
        "Internal server error"

    });

  }
);


// ======================================================
// START SERVER
// ======================================================

const PORT =
  process.env.PORT || 10000;


app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `🚀 Rajasthan Govt Vacancies server running on port ${PORT}`
    );

  }
);