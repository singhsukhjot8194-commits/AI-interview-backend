const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const allowedFrontendOrigins = new Set(
  [
    "https://ai-interview-frontend-steel.vercel.app",
    process.env.FRONTEND_ORIGIN,
  ].filter(Boolean),
);

app.use(
  cors({
    origin: (origin, callback) => {
      const isLocalFrontend =
        !origin || /^http:\/\/localhost:\d+$/.test(origin);
      const isConfiguredFrontend = allowedFrontendOrigins.has(origin);

      callback(null, isLocalFrontend || isConfiguredFrontend);
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

/* require all the routes here */
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

/* using all the routes here */
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

module.exports = app;
