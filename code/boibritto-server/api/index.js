const express = require('express');
const app = express();

app.get('/ping', (req, res) => {
  res.send('pong');
});

if (require.main === module) {
  // Only listen when not being imported by tests
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
