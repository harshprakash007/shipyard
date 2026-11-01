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

function isHttpsUrl(text) {
  try {
    return new URL(text).protocol === "https:";
  } catch (err) {
    return false;
  }
}

function isValidName(name) {
  return (
    /^[a-z0-9-]+$/.test(name) &&
    !name.startsWith("-") &&
    !name.endsWith("-") &&
    name.length <= 63
  );
}

function duplicateName(name) {
  return projects.some((val) => {
    return val.name === name;
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function validateProject(body) {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return ["Body must be a JSON object"];
  }

  const errors = [];

  if (typeof body.name !== "string" || !isValidName(body.name)) {
    errors.push(
      "name must be 1-63 lowercase letters, numbers or hyphens, and can't start or end with a hyphen",
    );
  }

  if (typeof body.repoUrl !== "string" || !isHttpsUrl(body.repoUrl)) {
    errors.push("repoUrl must be an https URL");
  }

  if (
    body.branch !== undefined &&
    (typeof body.branch !== "string" || body.branch.trim() === "")
  ) {
    errors.push("branch must be a non-empty string");
  }

  return errors;
}

let nextId = 0;

projects.forEach((val) => {
  if (val.id > nextId) {
    nextId = val.id;
  }
});
nextId++;
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

      if (duplicateName(parsed.name)) {
        sendJson(res, 409, {
          error: `A project named ${parsed.name} already exists`,
        });
        return;
      }

      const project = {
        id: nextId,
        name: parsed.name,
        repoUrl: parsed.repoUrl,
        branch: parsed.branch ?? "main",
        createdAt: new Date().toISOString(),
      };

      nextId++;
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
