const express = require('express');
const app = express();
const port = 8080;

app.use(express.json());

app.post('/alert', (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] ==== ALERT RECEIVED ====`);
  console.log(JSON.stringify(req.body, null, 2));
  console.log(`========================================\n`);
  res.status(200).send('Alert logged successfully');
});

app.listen(port, () => {
  console.log(`Webhook logger listening at http://localhost:${port}`);
});
