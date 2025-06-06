// Shared configuration utilities to eliminate file I/O duplication

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { dirname } from 'node:path';

/**
 * Safely read JSON file with error handling
 */
export async function readJsonFile<T = any>(filePath: string, defaultValue?: T): Promise<T> {
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Failed to read JSON file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Safely write JSON file with directory creation
 */
export async function writeJsonFile(filePath: string, data: any, pretty: boolean = true): Promise<void> {
  try {
    // Ensure directory exists
    const dir = dirname(filePath);
    await mkdir(dir, { recursive: true });
    
    // Write file
    const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    await writeFile(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write JSON file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Check if file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely update JSON file with backup
 */
export async function updateJsonFile<T>(
  filePath: string,
  updater: (current: T) => T,
  defaultValue: T
): Promise<void> {
  // Read current content
  const current = await readJsonFile(filePath, defaultValue);
  
  // Apply update
  const updated = updater(current);
  
  // Write updated content
  await writeJsonFile(filePath, updated);
}
