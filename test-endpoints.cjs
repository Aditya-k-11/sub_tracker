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
        const { token, user } = JSON.parse(data);
        console.log('Logged in!', user.email);

        // Fetch subscriptions to get an ID
        const subReq = http.request(
          {
            hostname: 'localhost',
            port: 5000,
            path: '/api/subscriptions',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
          },
          (subRes) => {
            let subData = '';
            subRes.on('data', chunk => subData += chunk);
            subRes.on('end', () => {
              const parsed = JSON.parse(subData);
              const subId = parsed.subscriptions[0]._id;
              console.log('Found sub ID:', subId);

              // Test Subscription Detail
              const detailReq = http.request(
                {
                  hostname: 'localhost',
                  port: 5000,
                  path: `/api/subscriptions/${subId}/detail`,
                  method: 'GET',
                  headers: { 'Authorization': `Bearer ${token}` }
                },
                (detailRes) => {
                  let detailData = '';
                  detailRes.on('data', chunk => detailData += chunk);
                  detailRes.on('end', () => {
                    console.log('Subscription Detail:', detailData.substring(0, 150) + '...');
                  });
                }
              );
              detailReq.end();

              // Test Category Detail
              const catReq = http.request(
                {
                  hostname: 'localhost',
                  port: 5000,
                  path: `/api/analytics/category/Entertainment`,
                  method: 'GET',
                  headers: { 'Authorization': `Bearer ${token}` }
                },
                (catRes) => {
                  let catData = '';
                  catRes.on('data', chunk => catData += chunk);
                  catRes.on('end', () => {
                    console.log('Category Detail:', catData.substring(0, 150) + '...');
                  });
                }
              );
              catReq.end();
            });
          }
        );
        subReq.end();
      });
    }
  );

  req.write(loginData);
  req.end();
};

testApi();
