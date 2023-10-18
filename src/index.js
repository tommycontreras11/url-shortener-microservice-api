const express = require('express');
const app = express();
const bodyparser = require("body-parser");
const LocalStorage = require("node-localstorage").LocalStorage;
var local = new LocalStorage('./scratch');
let urlItem = "", id = 0, count = 0;

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

const existsUrl = (urlString, id) => {
  urlItem = JSON.parse(local.getItem(urlString));
  return urlItem?.short_url === id ? urlItem : null;
};

app.get("/api/shorturl/:short_url", function(req, res) {
  id = parseInt(req.params.short_url);
  count = 0;

  for (let i = 0; i < local.length; i++) {
    if ((JSON.parse(local.getItem(local.key(i))).short_url == id) === true) {
      urlItem = JSON.parse(local.getItem(local.key(i)));
      res.redirect(urlItem.original_url);
      count++;
    }
  }
  if (count == 0) {
    res.json({
      error: "No short URL found for the given input",
    });
  }
});

const isValidUrl = (urlString) => {
  var urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // validate protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
    "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // validate fragment locator
  return !!urlPattern.test(urlString);
};

app.post("/api/shorturl", function(req, res) {
  urlItem = JSON.parse(local.getItem(req.body.url));

  if (existsUrl(req.body.url, urlItem?.short_url) != null) {
    res.json(urlItem);
  }

  if (existsUrl(req.body.url, urlItem?.short_url) == null && isValidUrl(req.body.url)) {
    local.setItem(req.body.url, JSON.stringify(
      {
        original_url: req.body.url,
        short_url: ++id
      }
    ));

    urlItem = JSON.parse(local.getItem(req.body.url));
    res.json(urlItem);
  }

  if (isValidUrl(req.body.url) === false) {
    res.json({
      error: "Invalid URL",
    });
  }
});

app.listen(3000);