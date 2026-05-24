const { gmd } = require("../gift");
const axios = require("axios");

const SWAGGER_URL = "https://api.imdbapi.dev/imdbapi.swagger.yaml";
const API_BASE = "https://api.imdbapi.dev";

let cached = { fetchedAt: 0, operations: [] };

function parseSwaggerMenu(raw) {
  const lines = raw.split(/\r?\n/);
  const operations = [];
  let currentPath = null;
  let currentTag = "general";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const tagMatch = line.match(/^\s*-\s*name:\s*(.+)$/);
    if (tagMatch && lines[i - 1]?.trim() === "tags:") {
      currentTag = tagMatch[1].trim();
    }

    const pathMatch = line.match(/^\s{2}(\/[^:]+):\s*$/);
    if (pathMatch) {
      currentPath = pathMatch[1].trim();
      continue;
    }

    const methodMatch = line.match(/^\s{4}(get|post|put|patch|delete):\s*$/i);
    if (methodMatch && currentPath) {
      const method = methodMatch[1].toUpperCase();
      let summary = "";
      let operationId = "";
      const params = [];

      for (let j = i + 1; j < Math.min(i + 80, lines.length); j++) {
        const look = lines[j];
        if (/^\s{4}[a-z]+:\s*$/.test(look) || /^\s{2}\/[^:]+:\s*$/.test(look)) break;

        const summaryMatch = look.match(/^\s{6}summary:\s*(.+)$/);
        if (summaryMatch) summary = summaryMatch[1].trim();

        const opMatch = look.match(/^\s{6}operationId:\s*(.+)$/);
        if (opMatch) operationId = opMatch[1].trim();

        const paramMatch = look.match(/^\s{10}name:\s*([A-Za-z0-9_]+)\s*$/);
        if (paramMatch) params.push(paramMatch[1]);
      }

      operations.push({ method, path: currentPath, summary, operationId, params, tag: currentTag });
    }
  }

  return operations;
}

async function getOperations(force = false) {
  const freshMs = 1000 * 60 * 20;
  if (!force && cached.operations.length && Date.now() - cached.fetchedAt < freshMs) return cached.operations;

  const { data } = await axios.get(SWAGGER_URL, { timeout: 60000 });
  const operations = parseSwaggerMenu(typeof data === "string" ? data : JSON.stringify(data));
  cached = { fetchedAt: Date.now(), operations };
  return operations;
}

function parseKeyValueArgs(argString = "") {
  const params = {};
  for (const token of argString.split(/\s+/).filter(Boolean)) {
    const idx = token.indexOf("=");
    if (idx < 1) continue;
    const key = token.slice(0, idx).trim();
    const value = token.slice(idx + 1).trim();
    if (key) params[key] = value;
  }
  return params;
}

gmd({ pattern: "imdbmenu", aliases: ["imdbendpoints", "imdbops"], category: "search", react: "🎬", description: "Fetch and list IMDbAPI.dev menu commands" },
async (from, Gifted, conText) => {
  const { reply, react } = conText;
  try {
    const operations = await getOperations(true);
    if (!operations.length) {
      await react("❌");
      return reply("No commands found in IMDbAPI documentation menu.");
    }

    const lines = operations.slice(0, 80).map((op, i) => `${i + 1}. ${op.method} ${op.path} → ${op.operationId || op.summary || "n/a"}`);
    const extra = operations.length > 80 ? `\n...and ${operations.length - 80} more.` : "";
    await react("✅");
    return reply(`*IMDbAPI.dev Commands (menu)*\nTotal: ${operations.length}\n\n${lines.join("\n")}${extra}\n\nUse: imdbcall <operationId> key=value key2=value2`);
  } catch (e) {
    await react("❌");
    return reply(`Failed to fetch IMDbAPI menu: ${e.message}`);
  }
});

gmd({ pattern: "imdbcall", aliases: ["imdbapi", "imdbrun"], category: "search", react: "🎞️", description: "Call any IMDbAPI.dev documented endpoint by operationId" },
async (from, Gifted, conText) => {
  const { q, reply, react } = conText;

  if (!q) {
    await react("❌");
    return reply("Usage: imdbcall <operationId> key=value\nExample: imdbcall searchTitles query=matrix limit=3");
  }

  try {
    const [operationId, ...rest] = q.split(/\s+/);
    const params = parseKeyValueArgs(rest.join(" "));
    const operations = await getOperations();
    const op = operations.find((x) => x.operationId?.toLowerCase() === operationId.toLowerCase());

    if (!op) {
      await react("❌");
      return reply(`Operation not found: ${operationId}. Run imdbmenu first.`);
    }

    let path = op.path;
    const usedPathParams = [];
    for (const key of Object.keys(params)) {
      const token = `{${key}}`;
      if (path.includes(token)) {
        path = path.replace(token, encodeURIComponent(params[key]));
        usedPathParams.push(key);
      }
    }

    if (/\{[^}]+\}/.test(path)) {
      await react("❌");
      return reply(`Missing required path params for ${op.path}. Provide values like key=value.`);
    }

    const query = { ...params };
    for (const k of usedPathParams) delete query[k];

    const url = `${API_BASE}${path}`;
    const res = await axios.request({ method: op.method, url, params: query, timeout: 60000 });
    const body = typeof res.data === "string" ? res.data : JSON.stringify(res.data, null, 2);
    const trimmed = body.length > 3500 ? `${body.slice(0, 3500)}\n...truncated...` : body;

    await react("✅");
    return reply(`*${op.method} ${op.path}* (${op.operationId || "no operationId"})\n\n\
\`
${trimmed}\n\
\``);
  } catch (e) {
    await react("❌");
    const msg = e.response?.data ? JSON.stringify(e.response.data).slice(0, 600) : e.message;
    return reply(`IMDbAPI call failed: ${msg}`);
  }
});
