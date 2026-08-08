import fetch from 'node-fetch'; 

const testSuggestionsAPI = async () => {
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
    console.log("✅ Logged in successfully!\n");

    console.log("2. Triggering Email Scan & Saving Suggestions...");
    const scanRes = await fetch('http://localhost:5000/api/suggestions/scan', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const scanData = await scanRes.json();
    console.log(`✅ Scan complete! New: ${scanData.newSuggestions}, Already Reviewed: ${scanData.alreadyReviewed}, Total Parsed: ${scanData.total}\n`);

    console.log("3. Fetching Pending Suggestions from Database...");
    const getRes = await fetch('http://localhost:5000/api/suggestions', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const getData = await getRes.json();
    console.log(`✅ Found ${getData.count} pending suggestions in the database!`);
    
    if (getData.suggestions && getData.suggestions.length > 0) {
        console.log("\nTop Suggestion in Database:");
        const topSuggestion = getData.suggestions[0];
        console.log(JSON.stringify(topSuggestion, null, 2));

        console.log("\n4. Testing the 'Confirm' endpoint on this suggestion (with dummy data)...");
        const confirmRes = await fetch(`http://localhost:5000/api/suggestions/${topSuggestion._id}/confirm`, {
          method: 'PATCH',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            
            cost: topSuggestion.suggestedCost || 9.99,
            billingCycle: topSuggestion.suggestedBillingCycle || 'monthly',
            nextRenewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
          })
        });

        const confirmData = await confirmRes.json();
        if (confirmRes.ok) {
          console.log(`✅ Successfully confirmed!`);
          console.log(`Created Subscription ID: ${confirmData.subscription._id}`);
          console.log(`Updated Suggestion Status: ${confirmData.suggestion.status}`);
        } else {
          console.log(`❌ Failed to confirm:`, confirmData);
        }

    } else {
        console.log("\nNo pending suggestions found to test confirming.");
        console.log("Try sending a mock 'Netflix receipt' email to your test Gmail account, wait 5 seconds, and run this script again!");
    }

  } catch (err) {
    console.error("Error:", err.message);
  }
};

testSuggestionsAPI();
