const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    intention: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false },
);

const roadmapDaySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    focus: { type: String, required: true },
    tasks: { type: [String], required: true },
  },
  { _id: false },
);

const skillGapSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    severity: { type: String, enum: ["high", "medium", "low"], required: true },
  },
  { _id: false },
);

const interviewReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    jobDescription: { type: String, required: true },
    profileSummary: { type: String, default: "" },
    resumeName: { type: String, default: "" },
    matchScore: { type: Number, required: true, min: 0, max: 100 },
    technicalQuestions: { type: [questionSchema], required: true },
    behavioralQuestions: { type: [questionSchema], required: true },
    preparationPlan: { type: [roadmapDaySchema], required: true },
    skillGaps: { type: [skillGapSchema], required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("interviewReports", interviewReportSchema);
