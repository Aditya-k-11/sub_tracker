import fetch from 'node-fetch'; 

const loginAndGetUrl = async () => {
  try {
    console.log("1. Logging in as seed user...");
    
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'adityakanojia.ad@gmail.com', password: 'aditya' })
    });

    let loginData = await loginRes.json();

    if (!loginRes.ok) {
        const loginRes2 = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'adityakanojia.ad@gmail.com', password: 'Demo@1234' }) 
          });
        loginData = await loginRes2.json();
        
        if (!loginRes2.ok) {
            console.error("Login failed. Ensure the server is running and the user exists.");
            console.error(loginData);
            return;
        }
    }

    const token = loginData.token;
    console.log("✅ Logged in successfully!");

    console.log("\n2. Fetching Google Auth URL...");
    const authRes = await fetch('http://localhost:5000/api/auth/google/connect', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const authData = await authRes.json();
    if (!authRes.ok) {
        console.error("Failed to get auth URL:", authData);
        return;
    }

    console.log("✅ Got Auth URL!");
    console.log("\n==========================================================================");
    console.log("CLICK THIS URL IN YOUR BROWSER:");
    console.log(authData.authUrl);
    console.log("==========================================================================\n");
    
    console.log("After completing the flow in your browser, check status by running:");
    console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:5000/api/auth/google/status`);
    console.log("\nOr to disconnect, run:");
    console.log(`curl -X POST -H "Authorization: Bearer ${token}" http://localhost:5000/api/auth/google/disconnect`);

  } catch (err) {
    console.error("Error:", err.message);
  }
};

loginAndGetUrl();
