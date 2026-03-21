import { Parser } from 'xml2js';

export class XmlParserService {
  constructor() {
    this.parser = new Parser({
      attrkey: '$',
      charkey: '_',
      explicitArray: false,
      mergeAttrs: true
    });
  }

  async parse(xmlContent) {
    const result = await this.parser.parseStringPromise(xmlContent);
    return this.convertToComponentTree(result);
  }

  convertToComponentTree(xmlNode) {
    if (!xmlNode) return null;

    // Get the root element (e.g., ConstraintLayout, LinearLayout)
    const rootTag = Object.keys(xmlNode)[0];
    const rootNode = xmlNode[rootTag];

    return this.processNode(rootTag, rootNode);
  }

  processNode(tagName, node) {
    if (!node) return null;

    const component = {
      id: this.extractId(node.$),
      type: this.mapTagName(tagName),
      properties: this.extractProperties(node.$),
      children: []
    };

    // Process children - handle both array and single object
    const childrenNodes = node.$$ ? (Array.isArray(node.$$) ? node.$$ : [node.$$]) : [];

    if (childrenNodes.length > 0) {
      component.children = childrenNodes
        .map(child => {
          const childTag = child['#name'] || Object.keys(child)[0];
          return this.processNode(childTag, child);
        })
        .filter(Boolean);
    }

    // Handle text content for TextView-like components
    if (node._ && typeof node._ === 'string' && node._.trim()) {
      component.text = node._.trim();
    }

    return component;
  }

  extractId(attrs) {
    if (!attrs) return null;
    const id = attrs['android:id'];
    return id ? id.replace('@+id/', '') : null;
  }

  extractProperties(attrs) {
    if (!attrs) return {};
    
    const props = {};
    for (const [key, value] of Object.entries(attrs)) {
      if (key.startsWith('android:')) {
        props[key.replace('android:', '')] = value;
      } else if (key.startsWith('app:')) {
        props[key] = value;
      } else if (key.startsWith('tools:')) {
        props[key] = value;
      } else if (key !== 'id') {
        props[key] = value;
      }
    }
    return props;
  }

  mapTagName(tagName) {
    // Map XML tag names to component names
    const tagMap = {
      'androidx.constraintlayout.widget.ConstraintLayout': 'ConstraintLayout',
      'androidx.core.widget.NestedScrollView': 'NestedScrollView',
      'android.widget.LinearLayout': 'LinearLayout',
      'android.widget.RelativeLayout': 'RelativeLayout',
      'android.widget.FrameLayout': 'FrameLayout',
      'android.widget.TextView': 'TextView',
      'android.widget.Button': 'Button',
      'android.widget.EditText': 'EditText',
      'android.widget.ImageView': 'ImageView',
      'android.widget.CheckBox': 'CheckBox',
      'android.widget.RadioButton': 'RadioButton',
      'android.widget.Switch': 'Switch',
      'android.widget.ProgressBar': 'ProgressBar',
      'android.widget.Spinner': 'Spinner',
      'com.google.android.material.card.MaterialCardView': 'MaterialCardView',
      'com.google.android.material.button.MaterialButton': 'MaterialButton',
      'com.google.android.material.textfield.TextInputEditText': 'TextInputEditText',
      'com.google.android.material.textfield.TextInputLayout': 'TextInputLayout',
      'com.google.android.material.appbar.AppBarLayout': 'AppBarLayout',
      'com.google.android.material.appbar.MaterialToolbar': 'MaterialToolbar',
      'com.google.android.material.navigation.NavigationView': 'NavigationView',
      'com.google.android.material.bottomnavigation.BottomNavigationView': 'BottomNavigationView',
      'androidx.recyclerview.widget.RecyclerView': 'RecyclerView',
      'androidx.viewpager2.widget.ViewPager2': 'ViewPager2',
      'android.webkit.WebView': 'WebView',
      'android.view.SurfaceView': 'SurfaceView',
      'androidx.camera.view.PreviewView': 'PreviewView'
    };

    return tagMap[tagName] || tagName.split('.').pop();
  }
}

export default XmlParserService;
