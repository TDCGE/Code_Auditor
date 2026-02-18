import fs from 'fs';
import path from 'path';

export interface Guidelines {
  raw: string;
  found: boolean;
  filePath: string;
}

export class GuidelinesLoader {
  static load(targetPath: string): Guidelines {
    const filePath = path.join(targetPath, 'guidelines.md');

    if (!fs.existsSync(filePath)) {
      return { raw: '', found: false, filePath: '' };
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    return { raw, found: true, filePath };
  }
}
