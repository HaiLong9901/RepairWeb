import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
@Injectable()
export class SystemConfigService {
  private readonly configPath = '././config.json';

  getConfig() {
    try {
      const fileData = fs.readFileSync(this.configPath, 'utf-8');
      return JSON.parse(fileData);
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  }

  updateConfig() {}
}
