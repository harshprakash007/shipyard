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

function validateProject(body) {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return ["Body must be a JSON object"];
  }

  const errors = [];

  if (typeof body.name !== "string" || body.name.trim() === "") {
    errors.push("name must be a non-empty string");
  }

  return errors;
}

let nextId = 0;

projects.forEach((val) => {
  if (val.id > id) {
    id = val.id;
  }
});
id++;
const server = http.createServer((req, res) => {
  // runs once for EVERY request that arrives
  console.log(req.method, req.url);
  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, { status: "ok" });
  } else if (req.method === "GET" && req.url === "/projects") {
    sendJson(res, 200, projects);
  } else if (req.method === "POST" && req.url === "/projects") {
    let data = "";
    req.setEncoding("utf-8");
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch (err) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }

      const errors = validateProject(parsed);
      if (errors.length > 0) {
        sendJson(res, 422, { errors });
        return;
      }

      const project = {
        id: nextId,
        name: parsed.name,
        repoUrl: parsed.repoUrl,
        branch: parsed.branch ?? "main",
        createdAt: new Date().toISOString(),
      };
      id++;
      projects.push(project);
      sendJson(res, 201, project);
    });
  } else {
    sendJson(res, 404, { error: "Not found" });
  }
});

server.listen(3000, () => {
  console.log("Shipyard running on http://localhost:3000");
});
