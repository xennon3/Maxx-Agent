import type { Template } from "./index.ts";

// A command-line script with a tested core function, standard library only,
// so it runs on any Python 3.9+ without pip.

export const pythonScript: Template = {
  id: "python-script",
  name: "Python script",
  icon: "🐍",
  about: "Command-line Python script with argparse and unittest tests, standard library only",
  folder: "my-script",
  try: ["Also count lines and characters", "Add a --json option", "Make it read every .txt file in a folder"],
  files: ({ name }) => ({
    "MAXX.md": `# ${name} (Python script)

Started from Maxx's python-script template: a working command-line tool with tests. Change it, don't rewrite it.
It uses only the standard library (Python 3.9+), so there is nothing to pip install.

- The work itself: pure functions in main.py (\`top_words\`); keep them free of printing and file access so they stay testable
- Command-line options: \`parse_args()\` in main.py
- Tests: test_main.py
- Run: \`python main.py README.md\` (or pipe text in: \`echo "a b a" | python main.py\`)
- Test: \`python -m unittest -v\`  (use python3 instead of python on macOS and Linux)
`,
    "main.py": `"""${name}: prints the most common words in a text file (or stdin)."""

import argparse
import re
import sys
from collections import Counter


def top_words(text, count=10, min_length=1):
    """Return the most common words as (word, times) pairs, most common first."""
    words = re.findall(r"[a-z0-9']+", text.lower())
    words = [w.strip("'") for w in words]
    return Counter(w for w in words if len(w) >= min_length).most_common(count)


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("file", nargs="?", help="text file to read (default: stdin)")
    parser.add_argument("-n", "--count", type=int, default=10, help="how many words to show")
    parser.add_argument("--min-length", type=int, default=1, help="skip words shorter than this")
    return parser.parse_args(argv)


def main(argv=None):
    args = parse_args(argv)
    if args.file:
        with open(args.file, encoding="utf-8", errors="replace") as f:
            text = f.read()
    else:
        text = sys.stdin.read()
    for word, times in top_words(text, args.count, args.min_length):
        print(f"{times:6}  {word}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
`,
    "test_main.py": `import unittest

from main import top_words


class TopWordsTest(unittest.TestCase):
    def test_counts_and_orders(self):
        self.assertEqual(top_words("b a b c b a", 2), [("b", 3), ("a", 2)])

    def test_ignores_case_and_punctuation(self):
        self.assertEqual(top_words("Hello, hello! HELLO?"), [("hello", 3)])

    def test_min_length(self):
        self.assertEqual(top_words("a bb a bb ccc", 5, min_length=2), [("bb", 2), ("ccc", 1)])


if __name__ == "__main__":
    unittest.main()
`,
    "README.md": `# ${name}

Prints the most common words in a text file.

\`\`\`
python main.py some.txt -n 5
python -m unittest
\`\`\`
`,
    ".gitignore": "__pycache__/\n.venv/\n",
  }),
};
