// simulate user auth during tests for firebase auth service protected route

const fetch = require("node-fetch");

const FIREBASE_AUTH_EMULATOR_HOST =
  process.env.FIREBASE_AUTH_EMULATOR_HOST || "localhost:9099";
const FIREBASE_API_KEY = "dummy-api-key";

async function createTestUserAndGetIdToken({ email, password }) {
  const res = await fetch(
    `http://${FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    },
  );

  const data = await res.json();

  if (data.error) {
    throw new Error(`Signup failed: ${JSON.stringify(data.error)}`);
  }

  return data.idToken;
}

module.exports = { createTestUserAndGetIdToken };
