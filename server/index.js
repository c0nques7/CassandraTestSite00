var { Client } = require("cassandra-driver");
var bcrypt = require('bcrypt'); 
const express = require('express'); 
var path = require('path'); 
const bodyParser = require('body-parser'); 
const app = express();
var port = 3000; 
const { v4: uuidv4 } = require('uuid');
const registerHandler = require('./register');
const loginHandler = require("./login");
const session = require('express-session');


app.use(session({
  secret: 'TABULARASA202024', // A secure secret string for signing cookies
  resave: false, //  Don't save untouched sessions
  saveUninitialized: true, // Create a session for every new request
  // ... (Optional) Configure a session store (e.g., for Redis or database) 
}));

app.use(express.json());
app.use(bodyParser.json()); 
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.post('/register', registerHandler);

app.post('/login', loginHandler);

app.post('/logout', (req, res) => {
  req.session.destroy(); // Destroy the session 
  res.redirect('/');  // Or any other appropriate page
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

app.get('/check-login', (req, res) => {
  if (req.session.isLoggedIn) {
    res.sendStatus(200); // OK - User logged in
  } else {
    res.sendStatus(401); // Unauthorized 
  }
});
