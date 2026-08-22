const http = require('http');

const payload = JSON.stringify({
  object: "instagram",
  entry: [
    {
      id: "17841479044967079",
      time: Math.floor(Date.now() / 1000),
      changes: [
        {
          field: "comments",
          value: {
            id: "comment_test_" + Date.now(),
            text: "PDF",
            media: {
              id: "18262009516307426"
            },
            from: {
              id: "user_test_999",
              username: "test_user_instagram"
            }
          }
        }
      ]
    }
  ]
});

const req = http.request(
  {
    hostname: "localhost",
    port: 5000,
    path: "/api/webhook/instagram",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload)
    }
  },
  (res) => {
    let body = "";
    res.on("data", (chunk) => (body += chunk));
    res.on("end", () => {
      console.log(`Webhook test status: ${res.statusCode}`);
      console.log(`Response body: ${body}`);
    });
  }
);

req.on("error", (err) => console.error("Webhook test error:", err.message));
req.write(payload);
req.end();
