const express = require('express');
const app = express();

app.post("/api/shorturl", function(req, res) {
  console.log('Hello World')
});

app.listen(3000);