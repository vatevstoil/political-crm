import sqlite3
conn = sqlite3.connect('prisma/dev.db')
cur = conn.cursor()

# Show first 5 people
cur.execute("SELECT id, full_name FROM people ORDER BY id LIMIT 5")
for row in cur.fetchall():
    print(f"ID={row[0]}: {row[1]}")

print("---")

# Total
cur.execute("SELECT count(*) FROM people")
print(f"Total: {cur.fetchone()[0]}")

# Test LIKE with a known name
cur.execute("SELECT id, full_name FROM people WHERE full_name LIKE '%Иван%'")
rows = cur.fetchall()
print(f"\nLIKE '%Иван%': {len(rows)} results")
for r in rows:
    print(f"  ID={r[0]}: {r[1]}")

# Test case insensitive
cur.execute("SELECT id, full_name FROM people WHERE full_name LIKE '%иван%'")
rows2 = cur.fetchall()
print(f"\nLIKE '%иван%' (lowercase): {len(rows2)} results")
for r in rows2:
    print(f"  ID={r[0]}: {r[1]}")

# Check ICU support
try:
    cur.execute("SELECT unicode('А')")
    print(f"\nunicode('А') = {cur.fetchone()[0]}")
except:
    print("\nNo unicode function")
