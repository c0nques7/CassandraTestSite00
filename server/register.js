const bcrypt = require('bcrypt');
const { Client } = require('cassandra-driver');
const { v4: uuidv4 } = require('uuid'); 

async function registerHandler(req, res) {
 
    const { email, password } = req.body;
    console.log(req.body);
    try {
      console.log("Password to hash:", password);
      //hashes password
      const hashedPassword = await bcrypt.hash(password, 10); // 10 is a common salt round
  
      //grabs the secure connection needed
      const client = new Client({cloud: {
        secureConnectBundle: "",
      },
      credentials: {
        username: "",
        password: "",
      },});
      
      //creates the uuid
      const uuid = uuidv4();
  
      const query = "INSERT INTO user_data.users (email, uuid, password, created_timestamp, account_type) VALUES (?, ?, ?, toTimestamp(now()), 'basic')"; // Assuming 'basic' for new accounts
      await client.execute(query, [email, uuid, hashedPassword]);
  
      res.redirect('/'); // Or any success response
  
    } catch (err) {
      console.error(err);
      res.status(500).send("Error"); // Handle potential errors
    }
  };

  module.exports = registerHandler;