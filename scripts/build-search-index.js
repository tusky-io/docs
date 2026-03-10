#!/usr/bin/env node

/**
 * Build a search index from MDX documentation files.
 * Parses frontmatter (title, description) and body text,
 * then writes a JSON index to static/search-index.json.
 *
 * Run: node scripts/build-search-index.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "static", "search-index.json");

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".github",
  "k8s",
  "scripts",
  "static",
  "logo",
  ".claude",
]);

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { attributes: {}, body: content };
  const body = content.slice(match[0].length).trim();
  const attributes = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      // Strip quotes
      if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        val = val.slice(1, -1);
      }
      attributes[key] = val;
    }
  }
  return { attributes, body };
}

function stripMdx(text) {
  return text
    // Remove JSX/MDX components like <Info>, <Warning>, <Tip>, <Note>, <Card>, etc.
    .replace(/<\/?[A-Z][a-zA-Z]*[^>]*>/g, "")
    // Remove HTML tags
    .replace(/<\/?[a-z][a-z0-9]*[^>]*>/g, "")
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, "")
    // Remove inline code
    .replace(/`[^`]+`/g, "")
    // Remove markdown links, keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    // Remove headings markup
    .replace(/^#{1,6}\s+/gm, "")
    // Remove bold/italic
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
    // Remove table separators
    .replace(/\|[-:| ]+\|/g, "")
    // Remove pipe characters (table cells)
    .replace(/\|/g, " ")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
}

function collectMdxFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name) && !entry.name.startsWith(".")) {
        collectMdxFiles(path.join(dir, entry.name), files);
      }
    } else if (entry.name.endsWith(".mdx")) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

function fileToSlug(filePath) {
  let slug = path.relative(ROOT, filePath).replace(/\.mdx$/, "");
  // introduction.mdx → /introduction, quickstart.mdx → /quickstart
  return "/" + slug;
}

function buildIndex() {
  const files = collectMdxFiles(ROOT);
  const index = [];

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { attributes, body } = parseFrontmatter(raw);

    const title = attributes.title || path.basename(filePath, ".mdx");
    const description = attributes.description || "";
    const content = stripMdx(body);
    const slug = fileToSlug(filePath);

    // Extract section headings for better search granularity
    const sections = [];
    const headingRegex = /^#{2,3}\s+(.+)$/gm;
    let match;
    while ((match = headingRegex.exec(body)) !== null) {
      sections.push(match[1].trim());
    }

    index.push({
      title,
      description,
      slug,
      sections: sections.join(" | "),
      content: content.slice(0, 2000), // Cap content length for index size
    });
  }

  // Ensure output directory exists
  const outDir = path.dirname(OUT);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(OUT, JSON.stringify(index, null, 0));
  console.log(`Search index built: ${index.length} pages → ${OUT}`);
  console.log(`Index size: ${(fs.statSync(OUT).size / 1024).toFixed(1)} KB`);
}

buildIndex();
