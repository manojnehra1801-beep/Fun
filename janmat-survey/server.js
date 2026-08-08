const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static("public"));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Rajasthan Govt Vacancies server is working"
  });
});

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Rajasthan Govt Vacancies running on port ${PORT}`);
});