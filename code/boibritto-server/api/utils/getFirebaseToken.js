require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

const fetch = require("node-fetch");

const email = process.env.TEST_USER_EMAIL;
const password = process.env.TEST_USER_PASS;
const apiKey = process.env.WEB_API_KEY;

const getIdToken = async () => {
  const loginUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

  const response = await fetch(loginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error("Firebase login failed: " + JSON.stringify(error));
  }

  const data = await response.json();
  return data.idToken;
};

// if run directly: node getFirebaseToken.js
if (require.main === module) {
  getIdToken()
    .then((token) => console.log("ID Token:\n", token))
    .catch(console.error);
}

module.exports = { getIdToken };
