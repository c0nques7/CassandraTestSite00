const { Client } = require("cassandra-driver");
const { v4: uuidv4 } = require('uuid'); // For generating a unique user_id
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
const bcrypt = require('bcrypt'); // Import bcrypt
const express = require('express'); // Import express
const path = require('path'); // Import path
const bodyParser = require('body-parser'); // Import body-parser
const app = express();
const port = 3000; // Or any preferred port

// Serve the HTML file
app.use(express.static(path.join(__dirname, 'public'))); // Assuming a 'public' folder for HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Parse form submissions
app.use(bodyParser.urlencoded({ extended: false })); 

// Route to handle login
app.post('/login', async (req, res) => {
  const { loginEmail, loginPassword } = req.body; 
  const loginResult = await loginUser(keyspace, tableName, loginEmail, loginPassword); 

  if (loginResult.isValid) { // Assuming loginUser returns an object like { isValid: true } 
    res.redirect('/success');  // Redirect to the success landing page
  } else {
    res.redirect('/'); // Redirect back to login on failure (or handle it differently)
  }
});

// Route to serve the landing page 
app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/success.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

async function insertUserData(keyspace, tableName) {
  const client = new Client({
    cloud: {
      secureConnectBundle: "secure-connect-primarysite01.zip",
    },
    credentials: {
      username: "rvxKLryIIRUdGDHuIhMErZNk",
      password: "p5NBLwWkQEens9uHJRFlzBzD2KThxPXQAi,TPZ0oCcurSZbnnAmuHaLdqDkCUsYlFOAyLv5+xQPamgT+Z_duI8NjQ0WU,7QB.t.mZ.zWPvPqvU,dvrEE8nSQKFhMUO6+",
    },
  });

  await client.connect();

  const email = await promptUser("Enter email address: ");
  const password = await promptUser("Enter password: ");

  // Hash the password
  const saltRounds = 10; // Adjust for desired security level
  const hash = await bcrypt.hash(password, saltRounds);
  
  // Check for uniqueness of email
  const uniquenessQuery = `SELECT email FROM ${keyspace}.${tableName} WHERE email = ?`;
  const uniquenessResult = await client.execute(uniquenessQuery, [email]);

  if (uniquenessResult.rowLength > 0) {
    console.log("Error: Email address already exists.");
  } else {
    const userId = uuidv4(); 
    const query = `INSERT INTO ${keyspace}.${tableName} (user_id, email, password, username, created_at) VALUES (?, ?, ?, ?, ?)`;
    const params = [userId, email, hash, null, Date.now()]; // Store the hash

    await client.execute(query, params);
    console.log("User data inserted successfully!");
  }

  await client.shutdown();
}

async function loginUser(keyspace, tableName) {
  const client = new Client({ cloud: {
    secureConnectBundle: "secure-connect-primarysite01.zip",
  },
  credentials: {
    username: "rvxKLryIIRUdGDHuIhMErZNk",
    password: "p5NBLwWkQEens9uHJRFlzBzD2KThxPXQAi,TPZ0oCcurSZbnnAmuHaLdqDkCUsYlFOAyLv5+xQPamgT+Z_duI8NjQ0WU,7QB.t.mZ.zWPvPqvU,dvrEE8nSQKFhMUO6+",
  },
  });

  await client.connect();

  const loginEmail = await promptUser("Enter email address or username: ");
  const loginPassword = await promptUser("Enter password: ");

  const query = `SELECT * FROM ${keyspace}.${tableName} WHERE email = ? ALLOW FILTERING`; // Adjust for username if needed
  const result = await client.execute(query, [loginEmail]);

  if (result.rowLength === 0) {
    console.log("Error: User not found.");
  } else {
    const user = result.first();
    const isValid = await bcrypt.compare(loginPassword, user.password);

    if (isValid) {
      console.log("Login successful!");
    } else {
      console.log("Error: Incorrect password.");
    }
  }

  await client.shutdown();
}

async function main() {
  const choice = await promptUser("Choose action (register / login): ");

  if (choice.toLowerCase() === 'register') {
    await insertUserData(keyspace, tableName);
  } else if (choice.toLowerCase() === 'login') {
    await loginUser(keyspace, tableName);
  } else {
    console.log("Invalid choice.");
  }
}

function promptUser(question) {
  return new Promise((resolve, reject) => {
    readline.question(question, (answer) => {
      resolve(answer);
    });
  });
}



const keyspace = 'live_coding';
const tableName = 'users';
insertUserData(keyspace, tableName);

main(); 





