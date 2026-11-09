// Chép ảnh chụp màn hình của repo (docs/screenshots/) vào public/anh/ trước khi build.
// Nguồn duy nhất của ảnh là docs/screenshots/ (README cũng dùng); public/anh/ là bản sinh ra, không commit.
import { cpSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..');
const dich = join(web, 'public/anh');
rmSync(dich, { recursive: true, force: true });
cpSync(join(web, '../docs/screenshots'), dich, { recursive: true });
console.log('[sync] docs/screenshots/ -> public/anh/');
