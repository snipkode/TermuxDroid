export class XmlGeneratorService {
  generate(component) {
    const { type, properties, children, text } = component;
    
    const fullType = this.mapToFullType(type);
    const attrs = this.generateAttributes(properties);
    
    if (!children || children.length === 0) {
      if (text) {
        return `<${fullType}${attrs ? '\n  ' + attrs : ''}>${this.escapeXml(text)}</${fullType}>`;
      }
      return `<${fullType}${attrs ? '\n  ' + attrs : ''} />`;
    }
    
    const childrenXml = children
      .map(child => {
        const childXml = this.generate(child);
        return childXml.split('\n').map(line => '  ' + line).join('\n');
      })
      .join('\n');
    
    return `<${fullType}${attrs ? '\n  ' + attrs : ''}>\n${childrenXml}\n</${fullType}>`;
  }

  generateAttributes(props) {
    if (!props) return '';
    
    return Object.entries(props)
      .filter(([key]) => key && key.trim() !== '')
      .map(([key, value]) => {
        const formattedKey = key.startsWith('android:') || key.startsWith('app:') || key.startsWith('tools:') 
          ? key 
          : `android:${key}`;
        return `${formattedKey}="${this.escapeXml(value)}"`;
      })
      .join('\n  ');
  }

  mapToFullType(type) {
    const typeMap = {
      'ConstraintLayout': 'androidx.constraintlayout.widget.ConstraintLayout',
      'NestedScrollView': 'androidx.core.widget.NestedScrollView',
      'LinearLayout': 'android.widget.LinearLayout',
      'RelativeLayout': 'android.widget.RelativeLayout',
      'FrameLayout': 'android.widget.FrameLayout',
      'TextView': 'android.widget.TextView',
      'Button': 'android.widget.Button',
      'EditText': 'android.widget.EditText',
      'ImageView': 'android.widget.ImageView',
      'CheckBox': 'android.widget.CheckBox',
      'RadioButton': 'android.widget.RadioButton',
      'Switch': 'android.widget.Switch',
      'ProgressBar': 'android.widget.ProgressBar',
      'Spinner': 'android.widget.Spinner',
      'MaterialCardView': 'com.google.android.material.card.MaterialCardView',
      'MaterialButton': 'com.google.android.material.button.MaterialButton',
      'TextInputEditText': 'com.google.android.material.textfield.TextInputEditText',
      'TextInputLayout': 'com.google.android.material.textfield.TextInputLayout',
      'AppBarLayout': 'com.google.android.material.appbar.AppBarLayout',
      'MaterialToolbar': 'com.google.android.material.appbar.MaterialToolbar',
      'NavigationView': 'com.google.android.material.navigation.NavigationView',
      'BottomNavigationView': 'com.google.android.material.bottomnavigation.BottomNavigationView',
      'RecyclerView': 'androidx.recyclerview.widget.RecyclerView',
      'ViewPager2': 'androidx.viewpager2.widget.ViewPager2',
      'WebView': 'android.webkit.WebView',
      'SurfaceView': 'android.view.SurfaceView',
      'PreviewView': 'androidx.camera.view.PreviewView'
    };

    return typeMap[type] || type;
  }

  escapeXml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  generateFullLayout(component, layoutName = 'activity_main') {
    const xmlContent = this.generate(component);
    
    return `<?xml version="1.0" encoding="utf-8"?>
${xmlContent}`;
  }
}

export default XmlGeneratorService;
