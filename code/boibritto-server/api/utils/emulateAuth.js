// simulate user auth during tests for firebase auth service protected route

const fetch = require("node-fetch");

const FIREBASE_AUTH_EMULATOR_HOST =
  process.env.FIREBASE_AUTH_EMULATOR_HOST || "localhost:9099";
const FIREBASE_API_KEY = "dummy-api-key";

async function createTestUserAndGetIdToken({ email, password }) {
  // try sign up first
  let res = await fetch(
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

  let data = await res.json();

  if (data.error && data.error.message === "EMAIL_EXISTS") {
    // if user exists, sign in instead
    res = await fetch(
      `http://${FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
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

    data = await res.json();
    if (data.error) {
      throw new Error(`Sign-in failed: ${JSON.stringify(data.error)}`);
    }
  } else if (data.error) {
    throw new Error(`Signup failed: ${JSON.stringify(data.error)}`);
  }

  return data.idToken;
}

module.exports = { createTestUserAndGetIdToken };
