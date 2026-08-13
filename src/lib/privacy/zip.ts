function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    crc ^= data[i]!;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const dosTime =
    (date.getSeconds() >> 1) | (date.getMinutes() << 5) | (date.getHours() << 11);
  const dosDate =
    date.getDate() | ((date.getMonth() + 1) << 5) | ((date.getFullYear() - 1980) << 9);
  return { dosTime, dosDate };
}

function u16(value: number) {
  const buf = new Uint8Array(2);
  new DataView(buf.buffer).setUint16(0, value, true);
  return buf;
}

function u32(value: number) {
  const buf = new Uint8Array(4);
  new DataView(buf.buffer).setUint32(0, value, true);
  return buf;
}

export type ZipEntry = {
  name: string;
  data: Uint8Array;
};

export function createZip(entries: ZipEntry[]): Uint8Array {
  const { dosTime, dosDate } = dosDateTime();
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = new TextEncoder().encode(entry.name.replace(/\\/g, "/"));
    const data = entry.data;
    const crc = crc32(data);
    const local = new Uint8Array(30 + nameBytes.length + data.length);
    local.set(u32(0x04034b50), 0);
    local.set(u16(20), 4);
    local.set(u16(0x0800), 6);
    local.set(u16(0), 8);
    local.set(u16(dosTime), 10);
    local.set(u16(dosDate), 12);
    local.set(u32(crc), 14);
    local.set(u32(data.length), 18);
    local.set(u32(data.length), 22);
    local.set(u16(nameBytes.length), 26);
    local.set(u16(0), 28);
    local.set(nameBytes, 30);
    local.set(data, 30 + nameBytes.length);
    locals.push(local);

    const central = new Uint8Array(46 + nameBytes.length);
    central.set(u32(0x02014b50), 0);
    central.set(u16(20), 4);
    central.set(u16(20), 6);
    central.set(u16(0x0800), 8);
    central.set(u16(0), 10);
    central.set(u16(dosTime), 12);
    central.set(u16(dosDate), 14);
    central.set(u32(crc), 16);
    central.set(u32(data.length), 20);
    central.set(u32(data.length), 24);
    central.set(u16(nameBytes.length), 28);
    central.set(u16(0), 30);
    central.set(u16(0), 32);
    central.set(u16(0), 34);
    central.set(u16(0), 36);
    central.set(u32(0), 38);
    central.set(u32(offset), 42);
    central.set(nameBytes, 46);
    centrals.push(central);
    offset += local.length;
  }

  const centralSize = centrals.reduce((sum, part) => sum + part.length, 0);
  const eocd = new Uint8Array(22);
  eocd.set(u32(0x06054b50), 0);
  eocd.set(u16(0), 4);
  eocd.set(u16(0), 6);
  eocd.set(u16(entries.length), 8);
  eocd.set(u16(entries.length), 10);
  eocd.set(u32(centralSize), 12);
  eocd.set(u32(offset), 16);
  eocd.set(u16(0), 20);

  const total = offset + centralSize + eocd.length;
  const zip = new Uint8Array(total);
  let cursor = 0;
  for (const part of locals) {
    zip.set(part, cursor);
    cursor += part.length;
  }
  for (const part of centrals) {
    zip.set(part, cursor);
    cursor += part.length;
  }
  zip.set(eocd, cursor);
  return zip;
}

export function textFile(name: string, contents: string): ZipEntry {
  return { name, data: new TextEncoder().encode(contents) };
}
