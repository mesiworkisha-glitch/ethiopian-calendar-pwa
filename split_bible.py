import json
import os
import sys

SRC = sys.argv[1] if len(sys.argv) > 1 else "80-weahadu.json"
OUT_DIR = sys.argv[2] if len(sys.argv) > 2 else "bible-books"

with open(SRC, encoding="utf-8") as f:
    books = json.load(f)

os.makedirs(OUT_DIR, exist_ok=True)

total_in = os.path.getsize(SRC)
total_out = 0

for book in books:
    n = book["book_number"]
    path = os.path.join(OUT_DIR, f"{n}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(book, f, ensure_ascii=False, separators=(",", ":"))
    total_out += os.path.getsize(path)

print(f"{SRC}: {total_in / 1_000_000:.2f} MB")
print(f"{len(books)} book files written to {OUT_DIR}/: {total_out / 1_000_000:.2f} MB total")
print(f"Largest single fetch is now one book instead of all {len(books)}.")
