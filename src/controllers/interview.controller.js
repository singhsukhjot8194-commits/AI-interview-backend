const PDFDocument = require("pdfkit");
const interviewReportModel = require("../models/interviewReport.model");
const { generateInterviewPlan } = require("../services/gemini.service");
const { extractResumeText } = require("../services/resume.service");

const createInterviewReportController = async (req, res) => {
  try {
    const { jobDescription, selfDescription = "" } = req.body;
    const resumeFile = req.file;

    if (!jobDescription || (!selfDescription && !resumeFile)) {
      return res.status(400).json({
        message:
          "Job description and a resume or self-description are required.",
      });
    }

    const resumeText = await extractResumeText(resumeFile);
    const plan = await generateInterviewPlan({
      jobDescription,
      selfDescription,
      resumeName: resumeFile ? resumeFile.originalname : undefined,
      resumeText,
    });

    const report = await interviewReportModel.create({
      user: req.user.id,
      jobDescription,
      resumeName: resumeFile ? resumeFile.originalname : "",
      ...plan,
    });

    return res.status(201).json({ interviewReport: report });
  } catch (error) {
    console.error("Interview generation error:", error);
    return res.status(500).json({
      message: "Unable to generate interview plan",
      error: error.message,
    });
  }
};

const getInterviewReportsController = async (req, res) => {
  try {
    const interviewReports = await interviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 });
    return res.status(200).json({ interviewReports });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch interview plans" });
  }
};

const getInterviewReportController = async (req, res) => {
  try {
    const interviewReport = await interviewReportModel.findOne({
      _id: req.params.interviewId,
      user: req.user.id,
    });
    if (!interviewReport) {
      return res.status(404).json({ message: "Interview plan not found" });
    }
    return res.status(200).json({ interviewReport });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch interview plan" });
  }
};

const generateResumePdfController = async (req, res) => {
  try {
    const report = await interviewReportModel.findOne({
      _id: req.params.interviewReportId,
      user: req.user.id,
    });
    if (!report) {
      return res.status(404).json({ message: "Interview plan not found" });
    }

    const document = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=interview-plan-${report._id}.pdf`,
    );
    document.pipe(res);
    document.fontSize(22).text(report.title);
    document.moveDown().fontSize(12).text(`Match score: ${report.matchScore}%`);
    document
      .moveDown()
      .text(report.profileSummary || "Personalized interview preparation plan");
    document.moveDown().fontSize(16).text("Technical questions");
    report.technicalQuestions.forEach((item, index) =>
      document
        .moveDown(0.5)
        .fontSize(11)
        .text(`${index + 1}. ${item.question}\nModel answer: ${item.answer}`),
    );
    document.moveDown().fontSize(16).text("Behavioral questions");
    report.behavioralQuestions.forEach((item, index) =>
      document
        .moveDown(0.5)
        .fontSize(11)
        .text(`${index + 1}. ${item.question}\nModel answer: ${item.answer}`),
    );
    document.end();
  } catch (error) {
    return res.status(500).json({ message: "Unable to create PDF" });
  }
};

module.exports = {
  createInterviewReportController,
  getInterviewReportsController,
  getInterviewReportController,
  generateResumePdfController,
};
