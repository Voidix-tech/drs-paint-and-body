import { neon } from "@neondatabase/serverless";
import { promises as fs } from "node:fs";
import path from "node:path";
import { seedServices, seedWork } from "./seed";
import type { Kind, RecordData, Service, Work } from "./types";

type Row = { id: string; kind: Kind; data: RecordData };
const directory = path.join(process.cwd(), ".demo");
const file = path.join(directory, "content.json");
const initial: Row[] = [...seedServices.map(data => ({ id: data.id, kind: "service" as const, data })), ...seedWork.map(data => ({ id: data.id, kind: "work" as const, data }))];
export const storageMode = () => process.env.DATABASE_URL ? "neon" : "local";
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
let initialized: Promise<void> | undefined;
const globalStore = globalThis as typeof globalThis & { drsQueue?: Promise<unknown> };

async function prepare() {
  if (!sql) return;
  if (!initialized) initialized = (async () => {
    await sql`CREATE TABLE IF NOT EXISTS drs_content (id TEXT PRIMARY KEY, kind TEXT NOT NULL, data JSONB NOT NULL)`;
    // The sentinel prevents removed seed records from reappearing on restart.
    await sql`WITH first_run AS (INSERT INTO drs_content (id, kind, data) VALUES ('__seed__', 'meta', '{}'::jsonb) ON CONFLICT DO NOTHING RETURNING id) INSERT INTO drs_content (id, kind, data) SELECT item->>'id', item->>'kind', item->'data' FROM jsonb_array_elements(${JSON.stringify(initial)}::jsonb) AS item WHERE EXISTS (SELECT 1 FROM first_run) ON CONFLICT DO NOTHING`;
  })().catch(error => { initialized = undefined; throw error; });
  await initialized;
}

async function local<T>(operation: (rows: Row[]) => T, write = false): Promise<T> {
  const run = async () => {
    await fs.mkdir(directory, { recursive: true });
    let rows: Row[];
    let fresh = false;
    try { rows = JSON.parse(await fs.readFile(file, "utf8")); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; rows = structuredClone(initial); fresh = true; }
    const result = operation(rows);
    if (write || fresh) { const temporary = `${file}.${crypto.randomUUID()}.tmp`; await fs.writeFile(temporary, JSON.stringify(rows), "utf8"); await fs.rename(temporary, file); }
    return result;
  };
  const task = (globalStore.drsQueue || Promise.resolve()).then(run, run);
  globalStore.drsQueue = task.catch(() => undefined);
  return task;
}

export async function list<T extends RecordData>(kind: Kind): Promise<T[]> {
  await prepare();
  if (sql) { const rows = await sql`SELECT data FROM drs_content WHERE kind=${kind} ORDER BY id`; return rows.map(row => row.data as T); }
  return local(rows => rows.filter(row => row.kind === kind).map(row => row.data as T));
}
export async function get<T extends RecordData>(kind: Kind, id: string): Promise<T | undefined> {
  await prepare();
  if (sql) { const rows = await sql`SELECT data FROM drs_content WHERE id=${id} AND kind=${kind}`; return rows[0]?.data as T | undefined; }
  return local(rows => rows.find(row => row.kind === kind && row.id === id)?.data as T | undefined);
}
export async function save<T extends RecordData>(kind: Kind, data: T): Promise<T> {
  await prepare();
  if (sql) await sql`INSERT INTO drs_content (id,kind,data) VALUES (${data.id},${kind},${JSON.stringify(data)}::jsonb) ON CONFLICT (id) DO UPDATE SET data=EXCLUDED.data WHERE drs_content.kind=EXCLUDED.kind`;
  else await local(rows => { const index = rows.findIndex(row => row.kind === kind && row.id === data.id); const row = { id: data.id, kind, data }; if (index < 0) rows.push(row); else rows[index] = row; }, true);
  return data;
}
export async function remove(kind: Kind, id: string) {
  await prepare();
  if (sql) await sql`DELETE FROM drs_content WHERE (id=${id} AND kind=${kind}) OR (${kind}='service' AND kind='work' AND data->>'serviceId'=${id})`;
  else await local(rows => { for (let i = rows.length - 1; i >= 0; i--) if ((rows[i].id === id && rows[i].kind === kind) || (kind === "service" && rows[i].kind === "work" && (rows[i].data as Work).serviceId === id)) rows.splice(i, 1); }, true);
}
export async function publicContent() {
  const [services, work] = await Promise.all([list<Service>("service"), list<Work>("work")]);
  const visible = services.filter(item => item.visible).sort((a,b) => a.order - b.order || a.title.localeCompare(b.title));
  const ids = new Set(visible.map(item => item.id));
  return { services: visible, work: work.filter(item => item.visible && ids.has(item.serviceId)) };
}
