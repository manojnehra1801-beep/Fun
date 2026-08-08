require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { createClient } = require("@supabase/supabase-js");

const app = express();

const PORT = process.env.PORT || 3000;


/* =========================
   MIDDLEWARE
========================= */

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

app.use(express.static("public"));


/* =========================
   SUPABASE
========================= */

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);


/* =========================
   HOME
========================= */

app.get("/", (req, res) => {

  res.sendFile(
    __dirname + "/public/index.html"
  );

});


/* =========================
   TEST SUPABASE CONNECTION
========================= */

app.get("/api/test", async (req, res) => {

  try {

    const { data, error } =
      await supabase
        .from("potential_candidates")
        .select("id")
        .limit(1);


    if (error) {

      console.error(
        "Supabase Error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Supabase connection failed",

        error: error.message

      });

    }


    res.json({

      success: true,

      message:
        "Supabase connected successfully",

      data: data

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


/* =========================
   SUBMIT POTENTIAL CANDIDATES
========================= */

app.post(
  "/api/candidates",
  async (req, res) => {

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


      /* BASIC VALIDATION */

      if (
        !state ||
        !district ||
        !village ||
        !panchayat ||
        !candidate1
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Please fill all required fields."

        });

      }


      /* INSERT INTO SUPABASE */

      const { data, error } =
        await supabase
          .from("potential_candidates")
          .insert([

            {

              state: state,

              district: district,

              village: village,

              panchayat: panchayat,

              candidate1:
                candidate1 || null,

              candidate2:
                candidate2 || null,

              candidate3:
                candidate3 || null,

              candidate4:
                candidate4 || null,

              mobile:
                mobile || null,

              likely:
                likely || null,

              extra_info:
                extraInfo || null

            }

          ])
          .select();


      /* DATABASE ERROR */

      if (error) {

        console.error(
          "Insert Error:",
          error
        );

        return res.status(500).json({

          success: false,

          message:
            "Could not save candidate information.",

          error: error.message

        });

      }


      /* SUCCESS */

      res.status(201).json({

        success: true,

        message:
          "Candidate information saved successfully.",

        data: data

      });


    } catch (error) {

      console.error(error);

      res.status(500).json({

        success: false,

        message: "Server error",

        error: error.message

      });

    }

  }
);


/* =========================
   SERVER
========================= */

app.listen(
  PORT,
  () => {

    console.log(
      `Janmat Survey running on port ${PORT}`
    );

  }
);