//First define require so has to use express, we had to import it because we are using type: module
import { createRequire } from "module";
const require = createRequire(import.meta.url);
//we define __dirname because we are using type: module
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
import { nanoid } from 'nanoid';
import { error } from "console";
const dns = require('dns')

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.DB_URI);

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

//Schema for the URL

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});
let Url = mongoose.model("Url", urlSchema)

// Your first API endpoint
app.use(bodyParser.urlencoded({extended : false}))
app.use(bodyParser.json())

app.post('/api/shorturl', function(req, res) {

  const client_url = req.body.url
  const suffix = nanoid(3);
  let newUrl = new Url ({
     original_url: client_url,
     short_url: suffix
     })
  let url = new URL(newUrl.original_url)
    
  newUrl.save()
        .then(() => {
          if(url.origin.slice(0,8) === 'https://' || url.origin.slice(0,7) === 'http://') {
            res.json({
            "original_url": newUrl.original_url,
            "short_url": newUrl.short_url,
           })
          }else {
            res.json({
              "error":"invalid url"
            })
          }
          
          })
        .catch((error) => {
          console.log(error)
        })

});

app.get('/api/shorturl/:suffix', (req, res) => {
  const generatedshortenurl = req.params.suffix
  Url.find({short_url: generatedshortenurl}).then((results) => {
    let userwebsite = results[0]
    res.redirect(userwebsite.original_url)
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
