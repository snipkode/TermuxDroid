import { ProjectLoaderService } from '../services/project-loader.service.js';
import { XmlParserService } from '../services/xml-parser.service.js';
import { join } from 'path';

const projectLoader = new ProjectLoaderService();
const xmlParser = new XmlParserService();

export const loadProject = async (req, res) => {
  try {
    const { projectPath } = req.body;
    
    if (!projectPath) {
      return res.status(400).json({
        success: false,
        error: 'Project path is required'
      });
    }

    console.log('Loading project from:', projectPath);
    
    // Load project structure
    const project = await projectLoader.load(projectPath);
    
    // Parse all layouts
    const layouts = [];
    for (const layoutFile of project.layoutFiles) {
      try {
        const layoutName = layoutFile.split('/').pop().replace('.xml', '');
        const xmlContent = await projectLoader.loadLayout(projectPath, layoutName);
        const components = await xmlParser.parse(xmlContent);
        
        layouts.push({
          id: layoutName,
          name: layoutName,
          file: layoutFile,
          components,
          xml: xmlContent
        });
      } catch (e) {
        console.error(`Error parsing layout ${layoutFile}:`, e.message);
      }
    }
    
    // Load resources
    const strings = await projectLoader.loadStrings(projectPath);
    const colors = await projectLoader.loadColors(projectPath);
    
    const response = {
      success: true,
      project: {
        name: project.name,
        packageName: project.packageName,
        path: projectPath,
        layoutFiles: project.layoutFiles,
        javaFiles: project.javaFiles
      },
      layouts,
      resources: {
        strings,
        colors
      }
    };
    
    console.log('Project loaded successfully:', project.name);
    res.json(response);
    
  } catch (error) {
    console.error('Load project error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
