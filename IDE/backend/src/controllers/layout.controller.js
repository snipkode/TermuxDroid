import { XmlGeneratorService } from '../services/xml-generator.service.js';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

const xmlGenerator = new XmlGeneratorService();

// Get project path from environment or use default
const getProjectPath = () => {
  return process.env.PROJECT_PATH || join(process.cwd(), '../..');
};

export const getLayout = async (req, res) => {
  try {
    const { id } = req.params;
    const projectPath = getProjectPath();
    
    const layoutPath = join(projectPath, 'app/src/main/res/layout', `${id}.xml`);
    const xmlContent = await readFile(layoutPath, 'utf-8');
    
    res.json({
      success: true,
      layout: {
        name: id,
        xml: xmlContent
      }
    });
    
  } catch (error) {
    console.error('Get layout error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateLayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { components, xml } = req.body;
    
    if (!components && !xml) {
      return res.status(400).json({
        success: false,
        error: 'Components or XML are required'
      });
    }
    
    const projectPath = getProjectPath();
    let finalXml;
    
    if (xml) {
      // Use provided XML directly
      finalXml = xml;
    } else if (components) {
      // Generate XML from components
      finalXml = xmlGenerator.generateFullLayout(components, id);
    }
    
    // Write to file
    const layoutPath = join(projectPath, 'app/src/main/res/layout', `${id}.xml`);
    await writeFile(layoutPath, finalXml, 'utf-8');
    
    console.log(`Layout "${id}" updated successfully`);
    
    res.json({
      success: true,
      message: 'Layout updated successfully',
      xml: finalXml,
      filePath: layoutPath
    });
    
  } catch (error) {
    console.error('Update layout error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
