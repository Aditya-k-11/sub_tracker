const http = require('http');

const testApi = () => {
  const loginData = JSON.stringify({
    email: 'adityakanojia.ad@gmail.com',
    password: 'aditya'
  });

  const req = http.request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    },
    (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const { token } = JSON.parse(data);
        console.log('Logged in!');

        // 1. Test Sort
        const sortReq = http.request(
          {
            hostname: 'localhost',
            port: 5000,
            path: '/api/subscriptions?sortBy=cost&sortOrder=desc',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
          },
          (sortRes) => {
            let sortData = '';
            sortRes.on('data', chunk => sortData += chunk);
            sortRes.on('end', () => {
              const parsed = JSON.parse(sortData);
              if (parsed.subscriptions && parsed.subscriptions.length > 0) {
                console.log('Highest cost sub:', parsed.subscriptions[0].cost);
                const subIds = parsed.subscriptions.slice(0, 3).map(s => s._id);

                // 2. Test Bulk
                const bulkPayload = JSON.stringify({
                  subscriptionIds: subIds,
                  action: { type: 'recategorize', category: 'Other' }
                });
                
                const bulkReq = http.request(
                  {
                    hostname: 'localhost',
                    port: 5000,
                    path: '/api/subscriptions/bulk',
                    method: 'PATCH',
                    headers: { 
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                      'Content-Length': bulkPayload.length
                    }
                  },
                  (bulkRes) => {
                    let bulkData = '';
                    bulkRes.on('data', chunk => bulkData += chunk);
                    bulkRes.on('end', () => {
                      console.log('Bulk Result:', bulkData);
                    });
                  }
                );
                bulkReq.write(bulkPayload);
                bulkReq.end();
              }
            });
          }
        );
        sortReq.end();
      });
    }
  );

  req.write(loginData);
  req.end();
};

testApi();
