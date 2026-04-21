#!/usr/bin/env python3
"""
Offline mirror for https://www.roea.org/
Fetches HTML pages (same-origin) plus linked static assets (css/js/images/fonts/pdfs).

Note: robots.txt asks Crawl-delay: 60s for generic bots; default --delay is 2s for a
one-off archival run. Increase --delay for stricter compliance.
"""
from __future__ import annotations

import argparse
import hashlib
import html.parser
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

USER_AGENT = "VerbalyMirror/1.0 (offline archival mirror)"
DEFAULT_DELAY = 2.0

ASSET_EXTENSIONS = frozenset(
    (
        ".css",
        ".js",
        ".mjs",
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".svg",
        ".ico",
        ".woff",
        ".woff2",
        ".ttf",
        ".eot",
        ".pdf",
        ".mp4",
        ".webm",
        ".xml",
        ".rss",
        ".txt",
        ".json",
        ".map",
    )
)


def canonical_url(url: str) -> str | None:
    try:
        p = urllib.parse.urlparse(url.strip())
    except Exception:
        return None
    if p.scheme not in ("http", "https"):
        return None
    host = p.netloc.lower().split(":")[0]
    if host == "roea.org":
        host = "www.roea.org"
    if host != "www.roea.org":
        return None
    path = p.path or "/"
    if not path.startswith("/"):
        path = "/" + path
    rebuilt = urllib.parse.ParseResult(
        scheme="https",
        netloc="www.roea.org",
        path=path,
        params=p.params,
        query=p.query,
        fragment="",
    )
    return urllib.parse.urlunparse(rebuilt)


def robots_disallowed_path(path: str, query: str) -> bool:
    pl = path.lower()
    if pl.endswith(".php"):
        return True
    if query and path in ("/", ""):
        return True
    if pl in ("/403.html", "/404.html", "/load.php"):
        return True
    if pl.startswith("/cart/") or pl.startswith("/article/"):
        return True
    return False


def fetch(url: str) -> tuple[int, dict[str, str], bytes]:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT, "Accept": "*/*"},
        method="GET",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        status = getattr(resp, "status", 200)
        headers = {k.lower(): v for k, v in resp.headers.items()}
        body = resp.read()
    return status, headers, body


def sniff_charset(headers: dict[str, str]) -> str:
    ct = headers.get("content-type", "").lower()
    if "charset=" in ct:
        m = re.search(r"charset=([\w.-]+)", ct, re.I)
        if m:
            return m.group(1).strip("\"'")
    return "utf-8"


def local_file_for_url(site_root: Path, absolute: str) -> Path:
    """Map https URL -> site_root/www.roea.org/... (offline tree)."""
    p = urllib.parse.urlparse(absolute)
    host = "www.roea.org"
    path = p.path or "/"
    if path.endswith("/"):
        rel = path.rstrip("/") + "/index.html"
    elif path == "/":
        rel = "/index.html"
    elif os.path.basename(path) == "":
        rel = path + "index.html"
    else:
        base = os.path.basename(path)
        if "." not in base:
            rel = path + ".html"
        else:
            rel = path
    if p.query:
        stem = Path(rel).stem
        suffix = Path(rel).suffix or ".html"
        qhash = hashlib.sha256(p.query.encode()).hexdigest()[:10]
        parent = Path(rel).parent.as_posix()
        rel = f"{parent}/{stem}_q{qhash}{suffix}"
    rel = rel.lstrip("/")
    out = site_root / host / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    return out


def path_looks_asset(url_path: str) -> bool:
    low = url_path.lower()
    base = os.path.basename(low)
    ext = Path(base).suffix if "." in base else ""
    if ext and ext.split(";")[0] in ASSET_EXTENSIONS:
        return True
    if "/cache/" in low or "/images/" in low:
        ext2 = Path(base).suffix.lower()
        if ext2 in (".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"):
            return True
    return False


def looks_like_html(headers: dict[str, str], url_path: str) -> bool:
    ct = headers.get("content-type", "").lower()
    if "text/html" in ct or "application/xhtml" in ct:
        return True
    low = url_path.lower()
    if low.endswith(".html") or low.endswith(".htm"):
        return True
    base = os.path.basename(low.rstrip("/"))
    if "." not in base:
        return True
    return False


class LinkExtractor(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.urls: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        ad = {k.lower(): (v or "") for k, v in attrs}
        found: list[str] = []
        for key in ("href", "src", "data-src", "poster"):
            if key in ad and ad[key]:
                found.append(ad[key])
        if tag == "img" and ad.get("srcset"):
            for part in ad["srcset"].split(","):
                bit = part.strip().split()
                if bit:
                    found.append(bit[0])
        if tag == "source" and ad.get("srcset"):
            for part in ad["srcset"].split(","):
                bit = part.strip().split()
                if bit:
                    found.append(bit[0])
        for raw in found:
            raw = raw.strip()
            if not raw or raw.startswith("#") or raw.lower().startswith("javascript:"):
                continue
            if raw.lower().startswith(("mailto:", "tel:")):
                continue
            self.urls.add(raw)


def extract_urls_from_css(css: bytes) -> set[str]:
    text = css.decode("utf-8", errors="ignore")
    out: set[str] = set()
    for m in re.finditer(r"url\s*\(\s*['\"]?([^'\")\s]+)['\"]?\s*\)", text, re.I):
        u = m.group(1).strip()
        if u and not u.lower().startswith("data:"):
            out.add(u)
    return out


def classify_and_enqueue(
    base_url: str,
    raw: str,
    html_seen: set[str],
    html_queue: list[str],
    asset_seen: set[str],
    asset_queue: list[str],
) -> None:
    joined = urllib.parse.urljoin(base_url, raw)
    cu = canonical_url(joined)
    if not cu:
        return
    pu = urllib.parse.urlparse(cu)
    if robots_disallowed_path(pu.path or "/", pu.query):
        return
    path = pu.path or "/"
    if path_looks_asset(path) or "/public/" in path.lower():
        if cu not in asset_seen:
            asset_seen.add(cu)
            asset_queue.append(cu)
        return
    # default: treat as navigable HTML candidate
    if cu not in html_seen:
        html_seen.add(cu)
        html_queue.append(cu)


def mirror(site_root: Path, delay: float, max_pages: int, max_assets: int) -> None:
    start = "https://www.roea.org/"
    html_seen: set[str] = {start}
    html_queue: list[str] = [start]
    asset_seen: set[str] = set()
    asset_queue: list[str] = []

    pages_done = 0
    assets_done = 0
    errors: list[str] = []

    def drain_html() -> None:
        nonlocal pages_done
        while html_queue and pages_done < max_pages:
            cu = html_queue.pop(0)
            pu = urllib.parse.urlparse(cu)
            if robots_disallowed_path(pu.path or "/", pu.query):
                continue
            try:
                time.sleep(delay)
                status, headers, body = fetch(cu)
            except Exception as e:
                errors.append(f"{cu} ERR {e}")
                continue
            if status >= 400:
                errors.append(f"{cu} HTTP {status}")
                continue

            out_path = local_file_for_url(site_root, cu)
            if looks_like_html(headers, pu.path or "/"):
                charset = sniff_charset(headers)
                try:
                    text = body.decode(charset)
                except UnicodeDecodeError:
                    text = body.decode("utf-8", errors="replace")
                out_path.write_text(text, encoding="utf-8")
                pages_done += 1

                parser = LinkExtractor()
                try:
                    parser.feed(text)
                except Exception as e:
                    errors.append(f"{cu} parse {e}")
                    parser.urls = set()
                for raw in parser.urls:
                    classify_and_enqueue(cu, raw, html_seen, html_queue, asset_seen, asset_queue)
            else:
                out_path.write_bytes(body)
                assets_done += 1

    def drain_assets() -> None:
        nonlocal assets_done, pages_done
        while asset_queue and assets_done < max_assets:
            cu = asset_queue.pop(0)
            pu = urllib.parse.urlparse(cu)
            if robots_disallowed_path(pu.path or "/", pu.query):
                continue
            try:
                time.sleep(delay)
                status, headers, body = fetch(cu)
            except Exception as e:
                errors.append(f"{cu} ERR {e}")
                continue
            if status >= 400:
                errors.append(f"{cu} HTTP {status}")
                continue

            out_path = local_file_for_url(site_root, cu)
            low = (pu.path or "").lower()
            if (
                pages_done < max_pages
                and looks_like_html(headers, pu.path or "/")
                and not path_looks_asset(pu.path or "/")
            ):
                charset = sniff_charset(headers)
                try:
                    text = body.decode(charset)
                except UnicodeDecodeError:
                    text = body.decode("utf-8", errors="replace")
                out_path.write_text(text, encoding="utf-8")
                pages_done += 1
                parser = LinkExtractor()
                parser.feed(text)
                for raw in parser.urls:
                    classify_and_enqueue(cu, raw, html_seen, html_queue, asset_seen, asset_queue)
                continue

            out_path.write_bytes(body)
            assets_done += 1

            if low.endswith(".css"):
                for u in extract_urls_from_css(body):
                    joined = urllib.parse.urljoin(cu, u)
                    nxt = canonical_url(joined)
                    if nxt and nxt not in asset_seen:
                        asset_seen.add(nxt)
                        asset_queue.append(nxt)

    # Alternate HTML waves and asset fetches until queues empty or limits block all work.
    for _ in range(100000):
        progressed = False
        if html_queue and pages_done < max_pages:
            drain_html()
            progressed = True
        if asset_queue and assets_done < max_assets:
            drain_assets()
            progressed = True
        if not progressed:
            break

    log = site_root / "_mirror_log.txt"
    lines = [
        f"pages_saved={pages_done}",
        f"assets_saved={assets_done}",
        f"html_queue_remaining={len(html_queue)}",
        f"asset_queue_remaining={len(asset_queue)}",
        f"errors={len(errors)}",
        "",
        "--- errors (first 800) ---",
        *errors[:800],
    ]
    log.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--site-root",
        type=Path,
        default=Path(__file__).resolve().parent,
        help="Folder containing www.roea.org/ mirror tree",
    )
    ap.add_argument("--delay", type=float, default=DEFAULT_DELAY)
    ap.add_argument("--max-pages", type=int, default=8000)
    ap.add_argument("--max-assets", type=int, default=100000)
    args = ap.parse_args()
    args.site_root.mkdir(parents=True, exist_ok=True)
    mirror(args.site_root, args.delay, args.max_pages, args.max_assets)


if __name__ == "__main__":
    main()
