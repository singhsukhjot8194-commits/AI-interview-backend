const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middlewares/auth.middlesware");
const interviewController = require("../controllers/interview.controller");

const interviewRouter = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.mimetype)) {
      return callback(new Error("Resume must be a PDF or DOCX file."));
    }
    callback(null, true);
  },
});

interviewRouter.use(authMiddleware.authUser);
interviewRouter.post(
  "/",
  (req, res, next) => {
    upload.single("resume")(req, res, (error) => {
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      next();
    });
  },
  interviewController.createInterviewReportController,
);
interviewRouter.get("/", interviewController.getInterviewReportsController);
interviewRouter.get(
  "/report/:interviewId",
  interviewController.getInterviewReportController,
);
interviewRouter.post(
  "/resume/pdf/:interviewReportId",
  interviewController.generateResumePdfController,
);

module.exports = interviewRouter;
