export function log(level: string, msg: string): void {
  const ts = new Date().toISOString().replace("T", " ").slice(0, 19);
  console.log(`${ts} [${level.toUpperCase().padEnd(5)}] ${msg}`);
}
