import type { Template } from "./index.ts";

// A page plus a small JSON API. The server is Python's standard library, so
// it runs without npm or pip; it prints its URL, which the Run panel picks up
// and shows in Preview.

export const webApp: Template = {
  id: "web-app",
  name: "Web app",
  icon: "🌐",
  about: "Notes web app: HTML/CSS/JS page with a JSON API on a standard-library Python server (python app.py)",
  folder: "my-web-app",
  try: ["Let me edit a note by clicking it", "Add a search box", "Give each note a color"],
  files: ({ name }) => ({
    "MAXX.md": `# ${name} (web app: static page + Python JSON API)

Started from Maxx's web-app template: a working notes app. Change it, don't rewrite it.
The server is Python's standard library only, so there is nothing to install.

- API routes (GET/POST/DELETE /api/notes): \`Handler\` in app.py; notes are saved to notes.json
- Page: static/index.html, styles in static/style.css, browser code in static/app.js
- Run: \`python app.py\` (keeps running; start it with the start_server tool), then open http://localhost:8000
  Set PORT to use another port.
- Test: \`python -m unittest -v\` (starts the server on a free port and calls the API)
`,
    "app.py": `"""${name}: serves static/ and a small JSON API for notes."""

import json
import os
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).parent
STATIC = ROOT / "static"
DATA = Path(os.environ.get("NOTES_FILE", ROOT / "notes.json"))
lock = threading.Lock()


def load_notes():
    try:
        return json.loads(DATA.read_text(encoding="utf-8"))
    except (FileNotFoundError, ValueError):
        return []


def save_notes(notes):
    DATA.write_text(json.dumps(notes, indent=2), encoding="utf-8")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(STATIC), **kwargs)

    def send_json(self, data, status=200):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json(self):
        length = int(self.headers.get("Content-Length") or 0)
        try:
            return json.loads(self.rfile.read(length) or b"{}")
        except ValueError:
            return {}

    def do_GET(self):
        if self.path == "/api/notes":
            return self.send_json(load_notes())
        return super().do_GET()

    def do_POST(self):
        if self.path != "/api/notes":
            return self.send_json({"error": "not found"}, 404)
        text = str(self.read_json().get("text", "")).strip()
        if not text:
            return self.send_json({"error": "text is required"}, 400)
        with lock:
            notes = load_notes()
            note = {"id": max((n["id"] for n in notes), default=0) + 1, "text": text}
            notes.append(note)
            save_notes(notes)
        return self.send_json(note, 201)

    def do_DELETE(self):
        prefix = "/api/notes/"
        if not self.path.startswith(prefix) or not self.path[len(prefix):].isdigit():
            return self.send_json({"error": "not found"}, 404)
        note_id = int(self.path[len(prefix):])
        with lock:
            notes = load_notes()
            kept = [n for n in notes if n["id"] != note_id]
            save_notes(kept)
        return self.send_json({"deleted": len(notes) - len(kept)})


def serve(port=8000):
    return ThreadingHTTPServer(("127.0.0.1", port), Handler)


if __name__ == "__main__":
    server = serve(int(os.environ.get("PORT", "8000")))
    print(f"Serving on http://localhost:{server.server_address[1]}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
`,
    "test_app.py": `import json
import os
import tempfile
import threading
import unittest
import urllib.request

os.environ["NOTES_FILE"] = os.path.join(tempfile.mkdtemp(), "notes.json")
import app  # noqa: E402  (after NOTES_FILE is set)


class ApiTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = app.serve(0)
        cls.base = f"http://127.0.0.1:{cls.server.server_address[1]}"
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def call(self, method, path, data=None):
        body = json.dumps(data).encode() if data is not None else None
        req = urllib.request.Request(self.base + path, body, {"Content-Type": "application/json"}, method=method)
        with urllib.request.urlopen(req) as res:
            return json.loads(res.read())

    def test_add_list_delete(self):
        note = self.call("POST", "/api/notes", {"text": "buy milk"})
        self.assertEqual(note["text"], "buy milk")
        self.assertIn(note, self.call("GET", "/api/notes"))
        self.assertEqual(self.call("DELETE", f"/api/notes/{note['id']}"), {"deleted": 1})
        self.assertNotIn(note, self.call("GET", "/api/notes"))

    def test_serves_page(self):
        with urllib.request.urlopen(self.base + "/") as res:
            self.assertIn(b"<title>", res.read())


if __name__ == "__main__":
    unittest.main()
`,
    "static/index.html": `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${name}</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
  <main>
    <h1>${name}</h1>
    <form id="add">
      <input id="text" placeholder="Write a note…" autocomplete="off" required>
      <button>Add</button>
    </form>
    <ul id="notes"></ul>
    <p id="empty">No notes yet.</p>
  </main>
  <script src="app.js"></script>
</body>
</html>
`,
    "static/style.css": `:root { --bg: #f7f7f5; --card: #fff; --ink: #1f2328; --mute: #6b7280; --accent: #2563eb; --line: #e5e7eb; }
@media (prefers-color-scheme: dark) {
  :root { --bg: #111318; --card: #1b1e24; --ink: #e5e7eb; --mute: #9ca3af; --line: #2b2f36; }
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font: 16px/1.5 system-ui, sans-serif; }
main { max-width: 560px; margin: 40px auto; padding: 0 16px; }
h1 { font-size: 26px; }
form { display: flex; gap: 8px; }
input { flex: 1; padding: 10px 12px; border: 1px solid var(--line); border-radius: 8px; background: var(--card); color: inherit; font: inherit; }
button { padding: 10px 16px; border: 0; border-radius: 8px; background: var(--accent); color: #fff; font: inherit; cursor: pointer; }
ul { list-style: none; padding: 0; }
li { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 10px 12px; margin-top: 8px; background: var(--card); border: 1px solid var(--line); border-radius: 8px; }
li button { background: none; color: var(--mute); padding: 4px 8px; }
#empty { color: var(--mute); }
`,
    "static/app.js": `const list = document.getElementById("notes");
const empty = document.getElementById("empty");
const input = document.getElementById("text");

async function api(method, path, data) {
  const res = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!res.ok) throw new Error(method + " " + path + " failed: " + res.status);
  return res.json();
}

function render(notes) {
  list.replaceChildren(
    ...notes.map((note) => {
      const li = document.createElement("li");
      const text = document.createElement("span");
      text.textContent = note.text;
      const del = document.createElement("button");
      del.textContent = "✕";
      del.title = "Delete";
      del.onclick = async () => {
        await api("DELETE", "/api/notes/" + note.id);
        refresh();
      };
      li.append(text, del);
      return li;
    }),
  );
  empty.hidden = notes.length > 0;
}

async function refresh() {
  render(await api("GET", "/api/notes"));
}

document.getElementById("add").onsubmit = async (e) => {
  e.preventDefault();
  await api("POST", "/api/notes", { text: input.value });
  input.value = "";
  refresh();
};

refresh().catch((err) => {
  console.error(err);
  empty.textContent = "Can't reach the API. Start the server with: python app.py";
});
`,
    ".gitignore": "__pycache__/\nnotes.json\n",
  }),
};
