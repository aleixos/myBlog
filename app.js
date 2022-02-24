//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const _  = require('lodash');
const request = require("request");
const https = require("https");



const homeStartingContent = "I'm Adam, Welcome to My Site!";
const aboutContent = "My name is Adam,";
const contactContent = "";
const failureContent = "Sorry, please try again!";
const successContent = "Thanks for filling out the form!";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



mongoose.connect("mongodb+srv://YOUR ADMIN ACCOUNT GOES HERE", {useNewUrlParser: true});


const postSchema = {
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema);

app.get("/", function(req, res){

  Post.find({}, function(err, posts){
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
      });
  });
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });


  post.save(function(err){
    if (!err){
        res.redirect("/");
    }
  });
});

app.get("/posts/:postId", function(req, res){

const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", {
      title: post.title,
      content: post.content
    });
  });

});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.post("/", function(req, res) {

  const firstName = req.body.fName
  const lastName = req.body.lName
  const email = req.body.email

  var data = {
    members: [{
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName
      }
    }]
  };

  var jsonData = JSON.stringify(data);
  const url = "https://MAILCHIMP API";

  const options = {
    method: "POST",
    auth: "adam1:814ba24b87a060ec2f88c4a116809ab1-us20"
  }

  const request = https.request(url, options, function(response) {
    if (response.statusCode === 200) {
      res.render("success", {successContent: successContent});
    } else {
      res.render("failure", {failureContent: failureContent});
    }
    response.on("data", function(data) {
      console.log(JSON.parse(data));
    })

  })

  request.write(jsonData);
  request.end();

});

app.post("/failure", function(req, res){
  res.redirect("/");
});


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
