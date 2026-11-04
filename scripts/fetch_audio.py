"""Reproduce ONLY IPA365's Wikimedia C060-C083 additions.

Metadata discovery (no file writes): py -3.12 scripts/fetch_audio.py --metadata
Download/verify: experiments/ipa-lab/.venv/Scripts/python.exe scripts/fetch_audio.py
Offline check:   experiments/ipa-lab/.venv/Scripts/python.exe scripts/fetch_audio.py --verify

Uses existing soundfile/numpy; installs nothing. Existing files are never replaced.
The reviewed metadata snapshot lives in public/audio/sources.json. Metadata mode
prints a proposed fresh snapshot; it never silently replaces that attribution.
"""

import argparse
import concurrent.futures
import hashlib
import io
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIO = ROOT / "public" / "audio"
MANIFEST = AUDIO / "sources.json"
USER_AGENT = "IPA365AudioCollector/1.1 (educational; https://github.com/congzhang365/IPA_flashcard)"
CANDIDATES = [
    ("ʘ", "Clic bilabial sourd.ogg"),
    ("ǀ", "Dental click.ogg"),
    ("ǃ", "Postalveolar click.ogg"),
    ("ǂ", "Palatoalveolar click.ogg"),
    ("ǁ", "Alveolar lateral click.ogg"),
    ("ɓ", "Voiced bilabial implosive.ogg"),
    ("ɗ", "Voiced alveolar implosive.ogg"),
    ("ʄ", "Voiced palatal implosive.ogg"),
    ("ɠ", "Voiced velar implosive.ogg"),
    ("ʛ", "Voiced uvular implosive.ogg"),
    ("ʍ", "Voiceless labio-velar fricative.ogg"),
    ("w", "Voiced labio-velar approximant.ogg"),
    ("ɥ", "LL-Q150 (fra)-WikiLucas00-IPA ɥ.wav"),
    ("ʜ", "Voiceless epiglottal trill.ogg"),
    ("ʢ", "Voiced epiglottal trill 2.ogg"),
    ("ʡ", "Epiglottal stop.ogg"),
    ("ɕ", "Voiceless alveolo-palatal sibilant.ogg"),
    ("ʑ", "Voiced alveolo-palatal sibilant.ogg"),
    ("ɺ", "Voiced alveolar lateral flap.wav"),
    ("ɧ", "Voiceless dorso-palatal velar fricative.ogg"),
    ("pʼ", "Bilabial ejective plosive.ogg"),
    ("tʼ", "Alveolar ejective plosive.ogg"),
    ("kʼ", "Velar ejective plosive.ogg"),
    ("sʼ", "Alveolar ejective fricative.ogg"),
]


class AttributionHTML(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = []
        self.links = []

    def handle_data(self, data):
        self.text.append(data)

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            href = dict(attrs).get("href")
            if href:
                self.links.append(urllib.parse.urljoin("https://commons.wikimedia.org", href))


def get(url):
    if urllib.parse.urlparse(url).hostname not in {"commons.wikimedia.org", "upload.wikimedia.org"}:
        raise ValueError("Only Wikimedia source URLs are allowed")
    for attempt in range(3):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(request, timeout=30) as response:
                return response.read()
        except urllib.error.HTTPError as error:
            # Do not retry a rate limit aggressively or bypass it with another URL.
            if error.code == 429:
                raise RuntimeError("Wikimedia rate limit; wait before retrying. Retry-After: "
                                   + str(error.headers.get("Retry-After", "not supplied"))
                                   + "; URL: " + url) from error
            if attempt == 2:
                raise
            time.sleep(2 ** (attempt + 1))
        except OSError:
            if attempt == 2:
                raise
            time.sleep(attempt + 1)


def metadata(item):
    index, (symbol, title) = item
    params = {
        "action": "query", "format": "json", "redirects": "1",
        "prop": "videoinfo|revisions", "rvprop": "ids|content", "rvslots": "main",
        "viprop": "url|size|sha1|timestamp|extmetadata|derivatives", "titles": "File:" + title,
    }
    result = json.loads(get("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)))
    page = next(iter(result["query"]["pages"].values()))
    info = page["videoinfo"][0]
    meta = {key: value["value"] for key, value in info["extmetadata"].items()}
    revision = page["revisions"][0]
    artist = meta.get("Artist", "").strip()
    author_source = "extmetadata.Artist"
    if not artist:
        wikitext = revision["slots"]["main"]["*"]
        match = re.search(r"^\s*\|\s*author\s*=\s*(.*?)(?=\n\s*\||\n\s*}})", wikitext, re.I | re.M | re.S)
        if match:
            artist = match.group(1).strip()
            author_source = "wikitext.author"
        else:
            match = re.search(r"Recorded by\s+(\[\[.*?\]\])", wikitext, re.I)
            if not match:
                raise ValueError(f"No author attribution found for {title}; manual review required")
            artist = match.group(1)
            author_source = "wikitext.recorded_by"
    evidence = artist
    artist = re.sub(r"\[\[([^]|]+)(?:\|([^]]+))?\]\]",
                    lambda m: '<a href="https://commons.wikimedia.org/wiki/'
                    + urllib.parse.quote(m.group(1).replace(" ", "_"), safe=":")
                    + '">' + (m.group(2) or m.group(1)) + '</a>', artist)
    parsed = AttributionHTML()
    parsed.feed(artist)
    author = " ".join("".join(parsed.text).split())
    derivatives = [d for d in info.get("derivatives", []) if d.get("type") == "audio/mpeg"]
    download_url = derivatives[0]["src"] if derivatives else info["url"]
    kind = "wikimedia_mp3_transcode" if derivatives else "local_soundfile_conversion"
    changes = (
        "Downloaded Wikimedia's MP3 transcode without further audio edits; saved under the app card ID."
        if derivatives else
        "Decoded the original with soundfile and encoded real MPEG Layer III MP3 (VBR, compression_level=0.0); "
        "sample rate/channels preserved, no trimming, resampling or level changes; saved under the app card ID."
    )
    caveats = []
    if index in (13, 14):
        caveats.append("Commons explicitly labels this recording as an epiglottal trill. The existing app card "
                       "calls the symbol an epiglottal fricative; do not present this as an independently "
                       "verified fricative-only recording. Requires phonetic review.")
    if index < 5:
        caveats.append("Click demonstration: accompanying closure/voicing or vowel context may occur; "
                       "the basic click-place symbol alone does not specify every accompaniment.")
    if index == 19:
        caveats.append("One recorded realization of ɧ; not an example of every Swedish sj-sound variant.")
    return {
        "id": f"C{60 + index:03}", "symbol": symbol, "filename": f"C{60 + index:03}.mp3",
        "chart_only": index >= 19, "commons_title": page["title"],
        "page_url": info["descriptionurl"], "page_id": page["pageid"],
        "page_revision_id": revision["revid"], "author": author,
        "author_urls": parsed.links, "author_evidence": evidence, "author_source": author_source,
        "license": meta["LicenseShortName"], "license_url": meta["LicenseUrl"],
        "original_url": info["url"], "original_sha1": info["sha1"],
        "original_uploaded_at": info["timestamp"], "download_url": download_url,
        "download_kind": kind, "changes": changes, "phonetic_caveats": caveats,
        "phonetic_review": "Not independently reviewed by ear; identification follows the Commons source.",
    }


def inspect_audio(raw):
    import numpy as np
    import soundfile as sf

    with sf.SoundFile(io.BytesIO(raw)) as audio:
        if audio.format != "MP3" or audio.subtype != "MPEG_LAYER_III":
            raise ValueError(f"Not genuine Layer III MP3: {audio.format}/{audio.subtype}")
        samples = audio.read(dtype="float64", always_2d=True)
        rate, channels = audio.samplerate, audio.channels
    if not samples.size or not np.isfinite(samples).all():
        raise ValueError("Empty or non-finite audio")
    peak = float(np.max(np.abs(samples)))
    rms = float(np.sqrt(np.mean(samples ** 2)))
    if peak < 1e-5 or rms < 1e-6:
        raise ValueError("Silent/nearly silent audio")
    return {"format": "MP3", "subtype": "MPEG_LAYER_III", "sample_rate_hz": rate,
            "channels": channels, "frames": len(samples), "duration_seconds": len(samples) / rate,
            "peak": peak, "rms": rms, "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()}


def collect(entry, verify_only):
    import soundfile as sf

    expected_index = int(entry["id"][1:]) - 60
    if not 0 <= expected_index < len(CANDIDATES):
        raise ValueError("Out-of-scope audio ID")
    if entry["filename"] != f"C{60 + expected_index:03}.mp3" or entry["symbol"] != CANDIDATES[expected_index][0]:
        raise ValueError("Filename/symbol mismatch")
    target = AUDIO / entry["filename"]
    if target.exists():
        raw = target.read_bytes()
        status = "verified_existing"
    else:
        if verify_only:
            raise FileNotFoundError(target)
        raw = get(entry["download_url"])
        if entry["download_kind"] == "local_soundfile_conversion":
            if hashlib.sha1(raw).hexdigest() != entry["original_sha1"]:
                raise ValueError("Original source has changed since metadata collection")
            samples, rate = sf.read(io.BytesIO(raw), dtype="float64", always_2d=True)
            encoded = io.BytesIO()
            sf.write(encoded, samples, rate, format="MP3", subtype="MPEG_LAYER_III", compression_level=0.0)
            raw = encoded.getvalue()
        elif entry["download_kind"] != "wikimedia_mp3_transcode":
            raise ValueError("Unknown download/conversion method")
        status = "downloaded"
    validation = inspect_audio(raw)
    expected_sha = entry.get("validation", {}).get("sha256")
    if expected_sha and validation["sha256"] != expected_sha:
        raise ValueError(f"Checksum mismatch for {target.name}; refusing replacement")
    if status == "downloaded":
        # Exclusive creation protects other agents' work, including a concurrent download.
        with target.open("xb") as output:
            output.write(raw)
    return {"id": entry["id"], "status": status, "validation": validation}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--metadata", action="store_true", help="Print Commons metadata only; do not write files")
    parser.add_argument("--verify", action="store_true", help="Verify all 24 local MP3s without using the network")
    args = parser.parse_args()
    if args.metadata and args.verify:
        parser.error("Choose metadata or verification, not both")
    if args.metadata:
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            entries = list(executor.map(metadata, enumerate(CANDIDATES)))
        result = {"schema_version": 1, "collection_version": "1.1.0-preview.1", "collected_on": "2026-10-30",
                  "scope": "Only new C060-C083 recordings; not a licence inventory for the pre-existing 87 MP3s.",
                  "files": entries}
    else:
        manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        entries = manifest["files"]
        if [e["id"] for e in entries] != [f"C{i:03}" for i in range(60, 84)]:
            raise ValueError("Manifest must contain exactly C060-C083 in order")
        results = []
        for entry in entries:
            result = collect(entry, args.verify)
            results.append(result)
            print(entry["filename"] + ": " + result["status"], file=sys.stderr, flush=True)
            if result["status"] == "downloaded":
                time.sleep(1)
        result = {"results": results}
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
