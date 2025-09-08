const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const removeHTTPHeader = require("../middleware/removeHeader");
const path = require("path");

const serverConfig = (app) => {
  app.use(cors({
    origin: ["https://digital-solutions-frontend-dydjh75s1-sashamoramovas-projects.vercel.app", "http://localhost:5173", "https://digital-solutions-production.up.railway.app"],
    credentials: true
  }));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(morgan("dev"));
  app.use(removeHTTPHeader);
  app.use("/static", express.static(path.resolve(__dirname, "..", "public")));
};

module.exports = serverConfig;
