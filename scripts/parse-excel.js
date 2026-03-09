const XLSX = require('xlsx');
const wb = XLSX.readFile('C:/Users/Vatev/Downloads/Величие - Франция 2025 08 инфо.xlsx');
const ws = wb.Sheets['Листа на членовете'];
const data = XLSX.utils.sheet_to_json(ws, {header:1});

const skip = ['Последна дата на актуализация :', 'Име'];
const rows = data.filter(r => {
  if (!r[2] || typeof r[2] !== 'string') return false;
  const name = r[2].trim();
  if (!name || skip.includes(name)) return false;
  return true;
});

console.log('Total people:', rows.length);
rows.forEach((r, i) => {
  const name = [r[2], r[3], r[4]].filter(Boolean).map(s => String(s).trim()).join(' ');
  const city = (r[5] && r[5] !== 'Секция') ? String(r[5]).trim() : '';
  const addr = r[6] ? String(r[6]).trim() : '';
  const phone = r[7] ? String(r[7]).trim() : '';
  console.log(`${i+1}. ${name} | ${city} | ${addr} | ${phone}`);
});
