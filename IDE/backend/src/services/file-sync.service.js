import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import chokidar from 'chokidar';

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const copyFileAsync = promisify(fs.copyFile);
const accessAsync = promisify(fs.access);

/**
 * File Sync Service
 * Handles synchronization between JSON component tree and Android XML source files
 */
export class FileSyncService {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.layoutDir = path.join(projectRoot, 'app', 'src', 'main', 'res', 'layout');
    this.backupDir = path.join(projectRoot, '.backups', 'layouts');
    this.watchers = new Map();
    
    // Ensure backup directory exists
    this.ensureBackupDir();
  }

  /**
   * Ensure backup directory exists
   */
  async ensureBackupDir() {
    try {
      await accessAsync(this.backupDir);
    } catch {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Get timestamp for backup files
   */
  getTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_');
  }

  /**
   * Backup existing layout file before overwrite
   * @param {string} layoutName - Name of the layout
   * @param {string} filePath - Full file path
   */
  async backup(filePath, layoutName = 'layout') {
    try {
      await accessAsync(filePath);
      const timestamp = this.getTimestamp();
      const fileName = path.basename(filePath, '.xml');
      const backupPath = path.join(this.backupDir, `${fileName}_${timestamp}.xml`);
      
      await copyFileAsync(filePath, backupPath);
      console.log(`✓ Backed up ${layoutName} to ${backupPath}`);
      
      // Cleanup old backups (keep last 10)
      await this.cleanupOldBackups(fileName);
      
      return backupPath;
    } catch (error) {
      console.log(`ℹ No existing file to backup: ${filePath}`);
      return null;
    }
  }

  /**
   * Cleanup old backups, keep only the last N
   * @param {string} layoutName - Layout name prefix
   * @param {number} keepCount - Number of backups to keep
   */
  async cleanupOldBackups(layoutName, keepCount = 10) {
    try {
      const files = await fs.promises.readdir(this.backupDir);
      const layoutBackups = files
        .filter(f => f.startsWith(layoutName) && f.endsWith('.xml'))
        .sort()
        .reverse();

      if (layoutBackups.length > keepCount) {
        for (let i = keepCount; i < layoutBackups.length; i++) {
          await fs.promises.unlink(path.join(this.backupDir, layoutBackups[i]));
        }
      }
    } catch (error) {
      console.error(`Error cleaning up backups: ${error.message}`);
    }
  }

  /**
   * Format XML with proper indentation
   * @param {string} xml - Raw XML string
   * @returns {string} - Formatted XML
   */
  formatXml(xml) {
    // Add XML declaration if missing
    if (!xml.trim().startsWith('<?xml')) {
      xml = '<?xml version="1.0" encoding="utf-8"?>\n' + xml;
    }

    // Simple XML formatter
    let formatted = '';
    let indent = 0;
    const tab = '  ';

    xml.split(/>\s*</).forEach(node => {
      if (node.match(/^\/\w/)) {
        indent -= 1;
      }

      formatted += tab.repeat(Math.max(0, indent)) + '<' + node + '>\n';

      if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('?xml')) {
        indent += 1;
      }
    });

    return formatted.substring(1, formatted.length - 2);
  }

  /**
   * Apply layout XML to source file
   * @param {string} layoutName - Name of the layout (without .xml)
   * @param {string} xmlContent - XML content to write
   * @param {Object} options - Options
   * @returns {Object} - Result with success status and file path
   */
  async applyLayout(layoutName, xmlContent, options = {}) {
    const {
      backup = true,
      format = true,
      notify = true
    } = options;

    const fileName = layoutName.endsWith('.xml') ? layoutName : `${layoutName}.xml`;
    const filePath = path.join(this.layoutDir, fileName);

    try {
      // Ensure layout directory exists
      await fs.promises.mkdir(this.layoutDir, { recursive: true });

      // Backup existing file
      if (backup) {
        await this.backup(filePath, layoutName);
      }

      // Format XML if requested
      const finalContent = format ? this.formatXml(xmlContent) : xmlContent;

      // Write to file
      await writeFileAsync(filePath, finalContent, 'utf-8');

      console.log(`✓ Applied layout: ${filePath}`);

      // Notify watchers
      if (notify) {
        this.notifyWatchers(layoutName, filePath);
      }

      return {
        success: true,
        path: filePath,
        backup: backup ? 'created' : 'skipped'
      };
    } catch (error) {
      console.error(`✗ Error applying layout: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Read layout file and return content
   * @param {string} layoutName - Name of the layout
   * @returns {Object} - { success, content, path }
   */
  async readLayout(layoutName) {
    const fileName = layoutName.endsWith('.xml') ? layoutName : `${layoutName}.xml`;
    const filePath = path.join(this.layoutDir, fileName);

    try {
      const content = await readFileAsync(filePath, 'utf-8');
      return {
        success: true,
        content,
        path: filePath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        path: filePath
      };
    }
  }

  /**
   * List all available layouts
   * @returns {string[]} - Array of layout names
   */
  async listLayouts() {
    try {
      const files = await fs.promises.readdir(this.layoutDir);
      return files
        .filter(f => f.endsWith('.xml'))
        .map(f => f.replace('.xml', ''));
    } catch (error) {
      console.error(`Error listing layouts: ${error.message}`);
      return [];
    }
  }

  /**
   * Watch for file changes
   * @param {string} layoutName - Layout to watch (or '*' for all)
   * @param {Function} callback - Callback when file changes
   */
  watch(layoutName, callback) {
    const watchPath = layoutName === '*' 
      ? this.layoutDir 
      : path.join(this.layoutDir, `${layoutName}.xml`);

    const watcher = chokidar.watch(watchPath, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 10
      }
    });

    watcher.on('change', (filePath) => {
      const name = path.basename(filePath, '.xml');
      console.log(`👁 File changed: ${name}`);
      callback(name, filePath);
    });

    this.watchers.set(layoutName, watcher);
    console.log(`👁 Watching: ${watchPath}`);

    return () => this.unwatch(layoutName);
  }

  /**
   * Stop watching a layout
   * @param {string} layoutName - Layout to unwatch
   */
  unwatch(layoutName) {
    const watcher = this.watchers.get(layoutName);
    if (watcher) {
      watcher.close();
      this.watchers.delete(layoutName);
      console.log(`🚫 Stopped watching: ${layoutName}`);
    }
  }

  /**
   * Stop all watchers
   */
  unwatchAll() {
    for (const [name, watcher] of this.watchers.entries()) {
      watcher.close();
    }
    this.watchers.clear();
    console.log('🚫 Stopped all file watchers');
  }

  /**
   * Notify watchers of a change
   * @param {string} layoutName - Layout that changed
   * @param {string} filePath - File path
   */
  notifyWatchers(layoutName, filePath) {
    // This is called when we make changes
    // External watchers will pick up the change
  }

  /**
   * Get file metadata
   * @param {string} layoutName - Layout name
   * @returns {Object} - File metadata
   */
  async getMetadata(layoutName) {
    const fileName = layoutName.endsWith('.xml') ? layoutName : `${layoutName}.xml`;
    const filePath = path.join(this.layoutDir, fileName);

    try {
      const stats = await fs.promises.stat(filePath);
      return {
        success: true,
        path: filePath,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a layout file
   * @param {string} layoutName - Layout name to delete
   * @param {boolean} backup - Whether to backup before delete
   * @returns {Object} - Result
   */
  async deleteLayout(layoutName, backup = true) {
    const fileName = layoutName.endsWith('.xml') ? layoutName : `${layoutName}.xml`;
    const filePath = path.join(this.layoutDir, fileName);

    try {
      if (backup) {
        await this.backup(filePath, layoutName);
      }

      await fs.promises.unlink(filePath);
      console.log(`✓ Deleted layout: ${filePath}`);

      return {
        success: true,
        path: filePath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default FileSyncService;
