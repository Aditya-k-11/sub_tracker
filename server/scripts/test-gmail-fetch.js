import fetch from 'node-fetch'; 

const loginAndFetchEmails = async () => {
  try {
    console.log("1. Logging in as seed user...");
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'adityakanojia.ad@gmail.com', password: 'aditya' }) 
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok) {
        console.error("Login failed:", loginData);
        return;
    }
    const token = loginData.token;
    console.log("✅ Logged in successfully!");

    console.log("\n2. Fetching Candidate Emails (Phase 13.3)...");
    const scanRes = await fetch('http://localhost:5000/api/admin/run-email-scan', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const scanData = await scanRes.json();
    if (!scanRes.ok) {
        console.error("Failed to run email scan:", scanData);
        return;
    }

    console.log(`✅ Success! Found ${scanData.parsedCandidates ? scanData.parsedCandidates.length : 0} parsed candidates (from ${scanData.rawCandidateCount} raw emails).`);
    if (scanData.parsedCandidates && scanData.parsedCandidates.length > 0) {
        console.log("\nTop 3 Candidates:");
        console.log(JSON.stringify(scanData.parsedCandidates.slice(0, 3), null, 2));
    } else {
        console.log("\nNo candidates found matching the broad search query.");
    }

  } catch (err) {
    console.error("Error:", err.message);
  }
};

loginAndFetchEmails();
