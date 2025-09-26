const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
// Import routes
const serviceNowRoutes = require("./src/routes/servicenow");

const app = express();
const port = 3000;
app.use(cors());

app.use(bodyParser.json());

app.use("/api/servicenow", serviceNowRoutes);

app.listen(port, () => {
  console.log(`Servidor Express corriendo en http://localhost:${port}`);
});
