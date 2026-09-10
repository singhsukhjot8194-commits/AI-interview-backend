const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const extractResumeText = async (file) => {
  if (!file) {
    return "";
  }

  if (file.mimetype === "application/pdf") {
    const result = await pdfParse(file.buffer);
    return result.text.trim();
  }

  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value.trim();
  }

  throw new Error("Only PDF and DOCX resumes are supported.");
};

module.exports = { extractResumeText };
