export async function downloadExcel(data: Record<string, unknown>[], filename: string) {
  const xlsx = await import('xlsx')
  
  const formattedData = data.map(row => {
    const newRow: Record<string, unknown> = {};
    for (const key in row) {
      newRow[key] = row[key] !== null && row[key] !== undefined ? row[key] : '';
    }
    return newRow;
  });

  const worksheet = xlsx.utils.json_to_sheet(formattedData);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Контакти");
  xlsx.writeFile(workbook, `${filename}.xlsx`);
}

export async function parseExcel(file: File): Promise<Record<string, unknown>[]> {
  const xlsx = await import('xlsx')
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = xlsx.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = xlsx.utils.sheet_to_json<Record<string, unknown>>(worksheet);
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
