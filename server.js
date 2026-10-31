import http from "node:http";

const projects = [
  {
    id: 1,
    name: "my-blog",
    repoUrl: "https://github.com/someone/my-blog",
    branch: "main",
    createdAt: "2026-10-29T10:00:00.000Z",
  },

  {
    id: 2,
    name: "m-blog",
    repoUrl: "https://github.com/someone/m-blog",
    branch: "main",
    createdAt: "2026-10-29T10:00:00.000Z",
  },
];

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  // runs once for EVERY request that arrives
  console.log(req.method, req.url);
  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, { status: "ok" });
  } else if (req.method === "GET" && req.url === "/projects") {
    sendJson(res, 200, projects);
  } else {
    sendJson(res, 404, { error: "Not found" });
  }
});

server.listen(3000, () => {
  console.log("Shipyard running on http://localhost:3000");
});
