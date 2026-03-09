const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');

const prisma = new PrismaClient();

function formatPhone(raw) {
  if (!raw) return null;
  let s = String(raw).replace(/\s+/g, '');
  // Bulgarian numbers starting with 359
  if (s.startsWith('359') && s.length >= 12) {
    return '+' + s;
  }
  // French numbers: 9 digits (missing leading 0) or 10 digits starting with 0
  if (/^\d{9}$/.test(s)) {
    return '+33 ' + s.slice(0, 1) + ' ' + s.slice(1, 3) + ' ' + s.slice(3, 5) + ' ' + s.slice(5, 7) + ' ' + s.slice(7, 9);
  }
  if (/^0\d{9}$/.test(s)) {
    s = s.slice(1); // remove leading 0
    return '+33 ' + s.slice(0, 1) + ' ' + s.slice(1, 3) + ' ' + s.slice(3, 5) + ' ' + s.slice(5, 7) + ' ' + s.slice(7, 9);
  }
  return s;
}

async function main() {
  const wb = XLSX.readFile('C:/Users/Vatev/Downloads/Величие - Франция 2025 08 инфо.xlsx');
  const ws = wb.Sheets['Листа на членовете'];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

  const skip = ['Последна дата на актуализация :', 'Име'];
  const rows = data.filter(r => {
    if (!r[2] || typeof r[2] !== 'string') return false;
    const name = r[2].trim();
    if (!name || skip.includes(name)) return false;
    return true;
  });

  console.log(`Found ${rows.length} people to import\n`);

  let imported = 0;
  let skipped = 0;

  for (const r of rows) {
    const fullName = [r[2], r[3], r[4]]
      .filter(Boolean)
      .map(s => String(s).trim())
      .join(' ');
    const city = (r[5] && r[5] !== 'Секция') ? String(r[5]).trim() : null;
    const address = r[6] ? String(r[6]).trim() : null;
    const phone = formatPhone(r[7]);

    // Check for duplicates by full name
    const existing = await prisma.person.findFirst({
      where: { fullName: fullName }
    });

    if (existing) {
      console.log(`SKIP (exists): ${fullName}`);
      skipped++;
      continue;
    }

    const person = await prisma.person.create({
      data: {
        fullName,
        city,
        address,
        phone,
        region: 'Франция',
        role: 'Supporter',
        status: 'Active',
      }
    });

    console.log(`OK: ${person.id} - ${fullName} | ${city || '-'} | ${phone || '-'}`);
    imported++;
  }

  console.log(`\nDone: ${imported} imported, ${skipped} skipped`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
