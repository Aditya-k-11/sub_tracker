const http = require('http');

const options = {
  hostname: 'backend.subtrack.svc.cluster.local',
  port: 5000,
  path: '/api/health/error',
  method: 'GET'
};

const endTime = Date.now() + 210000; 

function makeRequest() {
  const req = http.request(options, (res) => {
    
    res.on('data', () => {});
    res.on('end', () => {});
  });
  req.on('error', () => {});
  req.end();
}

console.log("Starting load generation...");

const interval = setInterval(() => {
  if (Date.now() > endTime) {
    clearInterval(interval);
    console.log("Finished load generation.");
    process.exit(0);
  }
  for (let i=0; i<10; i++) {
    makeRequest();
  }
}, 1000); 
