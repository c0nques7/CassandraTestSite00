const bcrypt = require('bcrypt');
const { Client } = require('cassandra-driver');

async function loginHandler(req, res) {
    const { email, password } = req.body;

    // 1. Input Validation (Basic) 
    if (!email || !password) {
        return res.status(400).send("Email and password are required");  
    }

    // 2. Retrieve User from Database
    const client = new Client({cloud: {
        secureConnectBundle: "secure-connect-userdb00.zip",
      },
      credentials: {
        username: "rtGLxIaBaiFNwbwqZcszwQSD",
        password: "-ke80FqeB_qOS-eK2ObE1O-mbFK0o.JFSYnPU3IRC5CtDSUrvNygznAcUio,6IL,D8Z0sSCE-C_1h,bcimjpk0hOLMqbmURXnS8jpG8i51Iomo-_olQaejHfAXsg.ndO",
      },});
    await client.connect();

    const query = 'SELECT * FROM user_data.users WHERE email = ? ALLOW FILTERING';
    const result = await client.execute(query, [email]);
    const user = result.first(); // Get the first matching user

    // 3. Handle User Not Found
    if (!user) {
        return res.status(401).send("Invalid email or password");  
    } 

    // 4. Password Comparison
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // 5. Authentication Result
    if (isPasswordValid) {
        // Successful login - Set up session (details further below)
        req.session.isLoggedIn = true; 
        req.session.userId = user.uuid; // Assuming you want to store user ID
        res.redirect('/profile.html');  // Or any other success route
    } else {
        res.status(401).send("Invalid email or password"); 
    }

    await client.shutdown();
}

module.exports = loginHandler;