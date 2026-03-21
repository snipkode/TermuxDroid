export class XmlGeneratorService {
  generate(component) {
    if (!component) return '';

    const { type, properties, children } = component;

    if (!type) {
      // If no type, it might be the root components object, get the first child
      if (children && children.length > 0) {
        return this.generate(children[0]);
      }
      return '';
    }

    const fullType = this.mapToFullType(type);
    const attrs = this.generateAttributes(properties || {});

    if (!children || children.length === 0) {
      return `<${fullType}${attrs ? '\n  ' + attrs : ''} />`;
    }

    const childrenXml = children
      .map(child => this.generate(child))
      .filter(xml => xml && xml.trim() !== '')
      .map(childXml => '  ' + childXml.replace(/\n/g, '\n  '))
      .join('\n');

    return `<${fullType}${attrs ? '\n  ' + attrs : ''}>\n${childrenXml}\n</${fullType}>`;
  }

  generateAttributes(props) {
    if (!props || typeof props !== 'object') return '';

    return Object.entries(props)
      .filter(([key, value]) => {
        // Skip empty keys and non-stringifiable values
        if (!key || key.trim() === '') return false;
        if (value === null || value === undefined) return false;
        if (typeof value === 'object') return false; // Skip objects
        return true;
      })
      .map(([key, value]) => {
        const formattedKey = key.startsWith('android:') || key.startsWith('app:') || key.startsWith('tools:')
          ? key
          : `android:${key}`;
        return `${formattedKey}="${this.escapeXml(String(value))}"`;
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
