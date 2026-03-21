/**
 * JSON Validator Service
 * Validates component JSON structure before conversion to XML
 */

export class JsonValidatorService {
  constructor() {
    this.validLayoutTypes = [
      'ConstraintLayout',
      'NestedScrollView',
      'LinearLayout',
      'RelativeLayout',
      'FrameLayout',
      'MaterialCardView'
    ];

    this.validViewTypes = [
      'TextView',
      'MaterialButton',
      'Button',
      'EditText',
      'ImageView',
      'CheckBox',
      'RadioButton',
      'Switch',
      'ProgressBar',
      'Spinner',
      'TextInputEditText',
      'TextInputLayout'
    ];

    this.requiredProperties = {
      layout_width: true,
      layout_height: true
    };

    this.validPropertyPatterns = {
      id: /^[@+]?id\/?[a-zA-Z0-9_]+$/,
      color: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
      dimension: /^-?\d+(\.\d+)?(dp|sp|px|pt)?$/,
      boolean: /^(true|false)$/
    };
  }

  /**
   * Validate a complete component tree
   * @param {Object} component - Component JSON object
   * @returns {Object} - { valid: boolean, errors: string[] }
   */
  validate(component) {
    const errors = [];

    if (!component) {
      return { valid: false, errors: ['Component is required'] };
    }

    if (!component.type) {
      errors.push('Component type is required');
    } else {
      const allValidTypes = [...this.validLayoutTypes, ...this.validViewTypes];
      if (!allValidTypes.includes(component.type)) {
        errors.push(`Invalid component type: ${component.type}`);
      }
    }

    if (component.properties) {
      const propErrors = this.validateProperties(component.properties);
      errors.push(...propErrors);
    }

    if (component.children && Array.isArray(component.children)) {
      const isLayout = this.validLayoutTypes.includes(component.type);
      if (!isLayout && component.children.length > 0) {
        errors.push(`Component ${component.type} cannot have children`);
      }

      component.children.forEach((child, index) => {
        const childResult = this.validate(child);
        if (!childResult.valid) {
          errors.push(`Child[${index}]: ${childResult.errors.join(', ')}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate component properties
   * @param {Object} props - Properties object
   * @returns {string[]} - Array of error messages
   */
  validateProperties(props) {
    const errors = [];

    // Check required properties
    for (const [key, required] of Object.entries(this.requiredProperties)) {
      if (required && !props[key]) {
        errors.push(`Missing required property: ${key}`);
      }
    }

    // Validate property values
    for (const [key, value] of Object.entries(props)) {
      if (typeof value !== 'string' && typeof value !== 'number') {
        continue; // Skip non-stringifiable values
      }

      const strValue = String(value);

      // Validate ID format
      if (key === 'id' && strValue && !strValue.startsWith('@')) {
        // Auto-fix: add @+id/ prefix if missing
        props[key] = `@+id/${strValue}`;
      }

      // Validate color format
      if (key.includes('color') || key.includes('Color')) {
        if (strValue && !strValue.startsWith('@') && !this.validPropertyPatterns.color.test(strValue)) {
          errors.push(`Invalid color format for ${key}: ${strValue}`);
        }
      }

      // Validate dimension format
      if (key.includes('width') || key.includes('height') || key.includes('margin') || key.includes('padding') || key.includes('size')) {
        if (strValue && !strValue.startsWith('@') && !this.validPropertyPatterns.dimension.test(strValue) && 
            !['match_parent', 'wrap_content'].includes(strValue.toLowerCase())) {
          errors.push(`Invalid dimension format for ${key}: ${strValue}. Use dp, sp, px, or match_parent/wrap_content`);
        }
      }
    }

    return errors;
  }

  /**
   * Sanitize component JSON
   * @param {Object} component - Component JSON object
   * @returns {Object} - Sanitized component
   */
  sanitize(component) {
    if (!component) return null;

    const sanitized = {
      type: component.type,
      properties: {},
      children: []
    };

    // Sanitize ID
    if (component.id) {
      sanitized.properties.id = component.id.startsWith('@') 
        ? component.id 
        : `@+id/${component.id}`;
    }

    // Sanitize properties
    if (component.properties) {
      for (const [key, value] of Object.entries(component.properties)) {
        if (value === null || value === undefined) continue;
        
        // Convert common values to Android format
        let sanitizedValue = value;
        
        if (typeof value === 'string') {
          // Convert match_parent, wrap_content
          if (value.toLowerCase() === 'match_parent') {
            sanitizedValue = 'match_parent';
          } else if (value.toLowerCase() === 'wrap_content') {
            sanitizedValue = 'wrap_content';
          }
          // Convert boolean strings
          else if (value.toLowerCase() === 'true') {
            sanitizedValue = 'true';
          } else if (value.toLowerCase() === 'false') {
            sanitizedValue = 'false';
          }
        }

        sanitized.properties[key] = sanitizedValue;
      }
    }

    // Sanitize children
    if (component.children && Array.isArray(component.children)) {
      sanitized.children = component.children
        .map(child => this.sanitize(child))
        .filter(child => child !== null);
    }

    // Preserve text content
    if (component.text) {
      sanitized.text = component.text;
    }

    return sanitized;
  }

  /**
   * Auto-fix common issues in component JSON
   * @param {Object} component - Component JSON object
   * @returns {Object} - Fixed component
   */
  autoFix(component) {
    if (!component) return null;

    const fixed = { ...component };

    // Auto-add required properties with defaults
    if (!fixed.properties) {
      fixed.properties = {};
    }

    if (!fixed.properties.layout_width) {
      fixed.properties.layout_width = 'wrap_content';
    }

    if (!fixed.properties.layout_height) {
      fixed.properties.layout_height = 'wrap_content';
    }

    // Auto-fix ID format
    if (fixed.properties.id && !fixed.properties.id.startsWith('@')) {
      fixed.properties.id = `@+id/${fixed.properties.id}`;
    }

    // Recursively fix children
    if (fixed.children && Array.isArray(fixed.children)) {
      fixed.children = fixed.children.map(child => this.autoFix(child));
    }

    return fixed;
  }
}

export default JsonValidatorService;
