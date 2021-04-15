const express = require("express");
const app = express();
const PORT = 3000; // default port 8080;
const  cookieParser = require('cookie-parser')

app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {};

function generateRandomString() {
  return  Math.random().toString(36).substring(7);
  // return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);
}


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user:users[req.cookies.userId]};
  console.log(users)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user:users[req.cookies.userId] }
  res.render("urls_new",templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user:users[req.cookies.userId] }
  res.render("urls_registration",templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, user:users[req.cookies.userId] }
  res.render("login",templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: /* What goes here? */ urlDatabase[req.params.shortURL], user:users[req.cookies.userId]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const randomStr = generateRandomString();
  urlDatabase[randomStr] = req.body.longURL; 
  res.redirect("/urls/:shortURL");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(Object.keys(req.params))
  delete urlDatabase[req.params.shortURL]; 
  // const templateVars = {urls: urlDatabase, username:null};
  // res.render("urls_index", templateVars); 
  res.redirect("/urls");
});
       
app.post("/urls/:id",(req,res) => {
  urlDatabase[req.params.id] = req.body.Edit;
  res.redirect("/urls");
})

app.post("/login", (req,res) =>{
  // console.log("req.body:"+req.body.username)
  for (let id in users) {
    if (users[id].email !== req.body.email) {
      res.status(403);
      res.send('403 Email is not register yet');
    } else if (users[id].email === req.body.email && users[id].password === req.body.password) {
      res.cookie('userId', id)
      res.redirect("/urls");
    } 
    res.status(403);
    res.write('403 Invalid password');
    res.end();
  }
})

app.post("/logout", (req,res) =>{
  res.clearCookie('userId');
  res.redirect("/urls");
})

app.post("/register", (req,res) => {
  for(let id in users) {
    if (users[id].email === req.body.email){
        res.status(400);
        res.write('400 Email is already register');
        res.end();
        
      };
  };
  if(req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.write('400 Invalid email or password');
    res.end();
  } 
  const userId = Math.random().toString(20).substring(7);
  const userInfo = {};
  userInfo.id = userId;
  userInfo.email = req.body.email;
  userInfo.password = req.body.password;
  users[userId] = userInfo;
  // console.log("user:" + users[userId].id);
  // console.log('req.body ', req.body)
  res.cookie('userId',userId);
  res.redirect("/urls")
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});