const express = require("express");
const app = express();
const PORT = 8080; // default port 8080;
// const  cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
const bcrypt = require('bcrypt');
const {getUserByEmail} = require("./helpers.js")

app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userId: 11111},
  "9sm5xK": {longURL: "http://www.google.com",userId: 11111}
};
const users = {};

//a function to check the status of the user
// const getUserByEmail = (email,object) => {
//   for (let key in object) {
//     if (email ===  object[key].email) {
//     return object[key];
//     }
//   return false;
//   }
// }
//get all the urls that created by a user
const  urlsForUser= (id,urlDatabase) => {
  const urlsByUser = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userId === id) {
      urlsByUser[url] = urlDatabase[url];
    }
  }
  return urlsByUser;
} 

function generateRandomString() {
  return  Math.random().toString(36).substring(7);
  // return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);
}

//homepage
app.get("/urls", (req, res) => {
  const urlsByUser = urlsForUser(req.session.user_id, urlDatabase)
  const templateVars = { urls: urlsByUser, user:users[req.session.user_id]};
  // console.log(urlDatabase)
  // console.log(req.session.user_id)
  // console.log( urlsByUser)
  res.render("urls_index", templateVars);
});

//creat a new Url page
app.get("/urls/new", (req, res) => {
  // console.log("req.session.user_id: " +req.cookies.userId)
  if (!req.session.user_id) {
    res.redirect("/login");
    return;
  }  
  const templateVars = { urls: urlDatabase, user:users[req.session.user_id]}
  res.render("urls_new",templateVars);
});

//redirect to register page
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user:users[req.session.user_id] }
  res.render("urls_registration",templateVars);
});

//redirect to log in page
app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, user:users[req.session.user_id] }
  res.render("login",templateVars);
});

//redirect to a specific url page
app.get("/urls/:shortURL", (req, res) => {
  // console.log(req.params)
  // console.log("req.params.shortURL :"+ req.params.shortURL)
  // // console.log("urlDatabase: ")
  // console.log( urlDatabase[req.params.shortURL])

  // const urlsByUser = urlsForUser(req.cookies.userId,urlDatabase)
  // const templateVars = { urls: urlsByUser, user:users[req.cookies.userId]};
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user:users[req.session.user_id]};
  res.render("urls_show", templateVars);
});

//a link to access the longUrl page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//creat a new shortUrl
app.post("/urls", (req, res) => {
  const randomStr = generateRandomString();
  const newUrl = {};
  newUrl.longURL = req.body.longURL;
  newUrl.userId = req.session.user_id;
  urlDatabase[randomStr] = newUrl; 
  // const templateVars = { shortURL: randomStr, longURL: urlDatabase[randomStr].longURL, user:users[req.cookies.userId]};
  // res.render("urls_show", templateVars);
  res.redirect("/urls");
});

//delete a exist shortUrl
app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log(Object.keys(req.params))
  if (!req.session.user_id) {
    res.redirect("/login");
    return;
  }  
  delete urlDatabase[req.params.shortURL]; 
   
  res.redirect("/urls");
});
       
//edit a exist shortUrl
app.post("/urls/:id",(req,res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
    return;
  }  
  urlDatabase[req.params.id] = req.body.Edit;
  res.redirect("/urls");
})



//login to an account
app.post("/login", (req,res) =>{
  // console.log("req.body:"+req.body.username)
  const user = getUserByEmail(req.body.email, users);
  if (!user) {
    res.status(403);
    res.write('403 Email is not register yet');
    res.end();
  } else if (bcrypt.compareSync(req.body.password, user.password)) {
    // users[user].password === req.body.password;
      // res.cookie('userId', user)
      req.session.user_id = user.id;
      res.redirect("/urls");
      return;
  } else {
    res.status(403);
    res.write('403 Invalid password');
    res.end();
  }
})


//logout from an account
app.post("/logout", (req,res) =>{
  // res.clearCookie('userId');
  req.session = null;
  res.redirect("/urls");
})

//register a new account
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
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  userInfo.id = userId;
  userInfo.email = req.body.email;
  userInfo.password = hashedPassword;
  users[userId] = userInfo;
  // console.log("user:" + users[userId].id);
  // console.log('req.body ', req.body)
  // res.cookie('userId',userId);
  req.session.user_id = userId;
  res.redirect("/urls")
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});