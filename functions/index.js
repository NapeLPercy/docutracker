/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

// Configure SMTP (Gmail example)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "lekoloanenape5@gmail.com",
    pass: "kahbrutlrasafnzc" // use Google App Password, not your Gmail login
  }
});

// Cloud Function to send email
exports.sendEmail = functions.https.onCall(async (data, context) => {
  const mailOptions = {
    from: "DocuTracker lekoloanenape5@gmail.com",
    to: data.to,
    subject: data.subject,
    text: data.text,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return { success: false, error: error.message };
  }
});


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
