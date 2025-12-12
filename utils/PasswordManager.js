class PasswordManager {
  constructor() {}
  generatePassword(email, persalNumber) {
    // Take first 3 letters of email (before @)
    const emailPart = email.split("@")[0].slice(0, 3).toUpperCase();

    // Take last 3 digits of persal number
    const persalPart = persalNumber.toString().slice(-3);

    // Random string (6 chars)
    const randomStr = Math.random().toString(36).slice(-6);

    // Ensure at least one special char
    const specialChars = "!@#$%^&*";
    const specialChar =
      specialChars[Math.floor(Math.random() * specialChars.length)];

    // Final password format
    const password = `${emailPart}${persalPart}${randomStr}${specialChar}`;

    console.log("Special password", password);
    return password;
  }
}
module.exports =  PasswordManager;