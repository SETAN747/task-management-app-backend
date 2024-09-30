const express = require("express");
const app = express();

app.use(express.json());  

require("dotenv").config();

const PORT = process.env.PORT || 6000;

// Connect to the database
const dbConnect = require("./config/database");
dbConnect();

// Route import and mount
const user = require("./routes/user");
app.use("/api/v1", user);

// Activating the server
app.listen(PORT, () => {
  console.log(`App is listening at ${PORT}`);
});
