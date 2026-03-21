import { XmlParserService } from '../services/xml-parser.service.js';
import { XmlGeneratorService } from '../services/xml-generator.service.js';
import { JsonValidatorService } from '../services/json-validator.service.js';
import { FileSyncService } from '../services/file-sync.service.js';

/**
 * Sync Controller
 * Handles synchronization between JSON and XML formats
 */
export class SyncController {
  constructor(projectRoot, wsController = null) {
    this.projectRoot = projectRoot;
    this.wsController = wsController;
    
    this.xmlParser = new XmlParserService();
    this.xmlGenerator = new XmlGeneratorService();
    this.jsonValidator = new JsonValidatorService();
    this.fileSync = new FileSyncService(projectRoot);
  }

  /**
   * Update layout from JSON component tree
   * POST /api/layout/update
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async updateLayout(req, res) {
    try {
      const { layoutName, json, options = {} } = req.body;

      // Validate input
      if (!layoutName) {
        return res.status(400).json({
          success: false,
          error: 'layoutName is required'
        });
      }

      if (!json) {
        return res.status(400).json({
          success: false,
          error: 'json component tree is required'
        });
      }

      // Auto-fix common issues
      const fixedJson = this.jsonValidator.autoFix(json);

      // Validate component tree
      const validation = this.jsonValidator.validate(fixedJson);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors
        });
      }

      // Convert JSON to XML
      const xmlContent = this.xmlGenerator.generate(fixedJson);
      const fullXml = this.xmlGenerator.generateFullLayout(fixedJson, layoutName);

      // Apply to file system
      const applyOptions = {
        backup: options.backup !== false,
        format: options.format !== false,
        notify: options.notify !== false
      };

      const result = await this.fileSync.applyLayout(layoutName, fullXml, applyOptions);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error
        });
      }

      // Notify WebSocket clients
      if (this.wsController && applyOptions.notify) {
        this.wsController.notifyLayoutUpdate(layoutName, {
          action: 'updated',
          json: fixedJson,
          xml: fullXml,
          path: result.path
        });
      }

      res.json({
        success: true,
        message: `Layout ${layoutName} updated successfully`,
        path: result.path,
        backup: result.backup,
        json: fixedJson,
        xml: fullXml
      });

    } catch (error) {
      console.error('Error in updateLayout:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get layout as JSON
   * GET /api/layout/:name/json
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async getLayoutJson(req, res) {
    try {
      const { name } = req.params;

      // Read XML file
      const readResult = await this.fileSync.readLayout(name);
      if (!readResult.success) {
        return res.status(404).json({
          success: false,
          error: `Layout ${name} not found`
        });
      }

      // Parse XML to JSON
      const components = await this.xmlParser.parse(readResult.content);

      res.json({
        success: true,
        layoutName: name,
        path: readResult.path,
        components: components.length > 0 ? components[0] : null
      });

    } catch (error) {
      console.error('Error in getLayoutJson:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get layout as XML
   * GET /api/layout/:name/xml
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async getLayoutXml(req, res) {
    try {
      const { name } = req.params;
      const { raw } = req.query;

      const readResult = await this.fileSync.readLayout(name);
      if (!readResult.success) {
        return res.status(404).json({
          success: false,
          error: `Layout ${name} not found`
        });
      }

      if (raw === 'true') {
        res.setHeader('Content-Type', 'application/xml');
        return res.send(readResult.content);
      }

      res.json({
        success: true,
        layoutName: name,
        path: readResult.path,
        xml: readResult.content
      });

    } catch (error) {
      console.error('Error in getLayoutXml:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * List all available layouts
   * GET /api/layouts
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async listLayouts(req, res) {
    try {
      const layouts = await this.fileSync.listLayouts();
      
      // Get metadata for each layout
      const layoutDetails = await Promise.all(
        layouts.map(async (name) => {
          const metadata = await this.fileSync.getMetadata(name);
          return {
            name,
            ...metadata
          };
        })
      );

      res.json({
        success: true,
        count: layouts.length,
        layouts: layoutDetails
      });

    } catch (error) {
      console.error('Error in listLayouts:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Delete a layout
   * DELETE /api/layout/:name
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async deleteLayout(req, res) {
    try {
      const { name } = req.params;
      const { backup } = req.query;

      const result = await this.fileSync.deleteLayout(
        name, 
        backup !== 'false'
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      // Notify WebSocket clients
      if (this.wsController) {
        this.wsController.notifyLayoutUpdate(name, {
          action: 'deleted',
          path: result.path
        });
      }

      res.json({
        success: true,
        message: `Layout ${name} deleted successfully`,
        path: result.path
      });

    } catch (error) {
      console.error('Error in deleteLayout:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Convert XML to JSON (standalone conversion)
   * POST /api/convert/xml-to-json
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async convertXmlToJson(req, res) {
    try {
      const { xml } = req.body;

      if (!xml) {
        return res.status(400).json({
          success: false,
          error: 'xml content is required'
        });
      }

      const components = await this.xmlParser.parse(xml);

      res.json({
        success: true,
        components: components.length > 0 ? components[0] : null
      });

    } catch (error) {
      console.error('Error in convertXmlToJson:', error);
      res.status(500).json({
        success: false,
        error: `XML parsing failed: ${error.message}`
      });
    }
  }

  /**
   * Convert JSON to XML (standalone conversion)
   * POST /api/convert/json-to-xml
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async convertJsonToXml(req, res) {
    try {
      const { json, full } = req.body;

      if (!json) {
        return res.status(400).json({
          success: false,
          error: 'json component tree is required'
        });
      }

      // Validate first
      const validation = this.jsonValidator.validate(json);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors
        });
      }

      let xmlContent;
      if (full) {
        xmlContent = this.xmlGenerator.generateFullLayout(json, 'layout');
      } else {
        xmlContent = this.xmlGenerator.generate(json);
      }

      res.json({
        success: true,
        xml: xmlContent
      });

    } catch (error) {
      console.error('Error in convertJsonToXml:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get sync status
   * GET /api/sync/status
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async getSyncStatus(req, res) {
    try {
      const layouts = await this.fileSync.listLayouts();
      const stats = this.wsController?.getStats() || {
        connectedClients: 0,
        totalSubscriptions: 0,
        layouts: []
      };

      res.json({
        success: true,
        projectRoot: this.projectRoot,
        layoutCount: layouts.length,
        layouts,
        websocket: stats
      });

    } catch (error) {
      console.error('Error in getSyncStatus:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Watch layout for changes
   * POST /api/sync/watch
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async watchLayout(req, res) {
    try {
      const { layoutName } = req.body;

      if (!layoutName) {
        return res.status(400).json({
          success: false,
          error: 'layoutName is required'
        });
      }

      // Setup file watcher
      const unwatch = this.fileSync.watch(layoutName, (name, filePath) => {
        // Notify WebSocket clients when file changes externally
        if (this.wsController) {
          this.wsController.notifyLayoutUpdate(name, {
            action: 'external_change',
            path: filePath
          });
        }
      });

      res.json({
        success: true,
        message: `Watching layout: ${layoutName}`,
        unwatch
      });

    } catch (error) {
      console.error('Error in watchLayout:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Cleanup on shutdown
   */
  cleanup() {
    this.fileSync.unwatchAll();
  }
}

export default SyncController;
