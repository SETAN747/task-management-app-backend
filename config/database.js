const mongoose = require("mongoose")

require("dotenv").config(); //load everything of .env file in the process object

const dbConnect = () => {
  mongoose.connect(process.env.DATABASE_URL , {

    useNewUrlParser : true,
    useUnifiedTopology : true ,

  })
  .then(() => console.log("DB connected Successfully"))
  .catch((error) => {
    console.log("Issue in DB connection")
    console.error(error.message)
    process.exit(1)
  })
}

module.exports = dbConnect