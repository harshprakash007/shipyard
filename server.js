import http from "node:http";

const server = http.createServer((req, res) => {
  // runs once for EVERY request that arrives
  console.log(req.method, req.url);
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

server.listen(3000, () => {
  console.log("Shipyard running on http://localhost:3000");
});
