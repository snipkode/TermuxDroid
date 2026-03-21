import { readFile, readdir, access } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export class ProjectLoaderService {
  async load(projectPath) {
    const project = {
      name: 'Unknown',
      packageName: 'com.unknown',
      path: projectPath,
      layoutFiles: [],
      javaFiles: [],
      resourceFiles: []
    };

    // Read AndroidManifest.xml to get package name
    try {
      const manifestPath = join(projectPath, 'app/src/main/AndroidManifest.xml');
      const manifestContent = await readFile(manifestPath, 'utf-8');
      
      const packageMatch = manifestContent.match(/package="([^"]+)"/);
      if (packageMatch) {
        project.packageName = packageMatch[1];
      }
      
      // Get app name from strings.xml
      try {
        const stringsPath = join(projectPath, 'app/src/main/res/values/strings.xml');
        const stringsContent = await readFile(stringsPath, 'utf-8');
        const appNameMatch = stringsContent.match(/<string name="app_name">([^<]+)<\/string>/);
        if (appNameMatch) {
          project.name = appNameMatch[1];
        }
      } catch (e) {
        console.log('Could not read app name from strings.xml');
      }
    } catch (e) {
      console.error('Error reading manifest:', e.message);
    }

    // Scan layout files
    const layoutDir = join(projectPath, 'app/src/main/res/layout');
    if (existsSync(layoutDir)) {
      const files = await readdir(layoutDir);
      project.layoutFiles = files
        .filter(f => f.endsWith('.xml'))
        .map(f => `app/src/main/res/layout/${f}`);
    }

    // Scan Java files
    const javaDir = join(projectPath, 'app/src/main/java');
    if (existsSync(javaDir)) {
      project.javaFiles = await this.scanJavaFiles(javaDir, '');
    }

    return project;
  }

  async scanJavaFiles(dir, relativePath) {
    const files = [];
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        const relPath = join(relativePath, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.scanJavaFiles(fullPath, relPath);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name.endsWith('.java')) {
          files.push(relPath);
        }
      }
    } catch (e) {
      console.error('Error scanning Java files:', e.message);
    }
    
    return files;
  }

  async loadStrings(projectPath) {
    const strings = {};
    try {
      const stringsPath = join(projectPath, 'app/src/main/res/values/strings.xml');
      const content = await readFile(stringsPath, 'utf-8');
      
      const matches = content.matchAll(/<string name="([^"]+)">([^<]+)<\/string>/g);
      for (const match of matches) {
        strings[match[1]] = match[2];
      }
    } catch (e) {
      console.error('Error loading strings:', e.message);
    }
    
    return strings;
  }

  async loadColors(projectPath) {
    const colors = {};
    try {
      const colorsPath = join(projectPath, 'app/src/main/res/values/colors.xml');
      const content = await readFile(colorsPath, 'utf-8');
      
      const matches = content.matchAll(/<color name="([^"]+)">#([^<]+)<\/color>/g);
      for (const match of matches) {
        colors[match[1]] = `#${match[2]}`;
      }
    } catch (e) {
      console.error('Error loading colors:', e.message);
    }
    
    return colors;
  }

  async loadLayout(projectPath, layoutName) {
    try {
      const layoutPath = join(projectPath, 'app/src/main/res/layout', `${layoutName}.xml`);
      const content = await readFile(layoutPath, 'utf-8');
      return content;
    } catch (e) {
      throw new Error(`Layout "${layoutName}" not found`);
    }
  }
}

export default ProjectLoaderService;
