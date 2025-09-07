const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const express = require("express");
const serverConfig = require("./config/serverConfig");
const indexRouter = require("./routes/index.routes");

const PORT = process.env.PORT || 3000;

const app = express();

serverConfig(app);

app.use("/api", indexRouter);

app.listen(PORT, () => {
  console.log(`Example server started on port http://localhost:${PORT}`);
});