const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(__dirname));

// Home Page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Demo Job Page
app.get("/job/ssc-cgl-2026", (req, res) => {

    const job = {
        title: "SSC CGL Recruitment 2026",
        department: "Staff Selection Commission",
        post: "Combined Graduate Level",
        qualification: "Bachelor Degree",
        age: "18-32 Years",
        lastDate: "15 August 2026",
        website: "https://ssc.gov.in",
        startDate: "20 July 2026",
        examDate: "October 2026"
    };

    res.render("job", { job });

});

app.listen(PORT, () => {
    console.log("Server Running on Port " + PORT);
});