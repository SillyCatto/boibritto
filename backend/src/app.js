const express = require("express");

const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Hello from /");
});

app.listen(PORT, () => {
  console.log(`server running on port: ${PORT}`);
});
