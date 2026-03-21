import { Parser } from 'xml2js';

export class XmlParserService {
  constructor() {
    this.parser = new Parser({
      attrkey: '$',
      charkey: '_',
      explicitArray: true,
      mergeAttrs: false,
      explicitChildren: true,
      childkey: '$$'
    });
  }

  async parse(xmlContent) {
    const result = await this.parser.parseStringPromise(xmlContent);
    return this.convertToComponentTree(result);
  }

  convertToComponentTree(xmlNode) {
    if (!xmlNode) return [];

    // Get the root element
    const rootTag = Object.keys(xmlNode)[0];
    const rootNode = xmlNode[rootTag];

    const component = this.processNode(rootTag, rootNode);
    return component ? [component] : [];
  }

  processNode(tagName, node) {
    if (!node) return null;

    // Extract attributes
    const attrs = node.$ || {};
    
    const component = {
      id: this.extractId(attrs),
      type: this.mapTagName(tagName),
      properties: this.extractProperties(attrs),
      children: []
    };

    // Process children - $$ is an object with tag names as keys
    if (node.$$) {
      const childrenArray = [];
      for (const [childTag, children] of Object.entries(node.$$)) {
        const childArray = Array.isArray(children) ? children : [children];
        childArray.forEach(child => {
          const processed = this.processNode(childTag, child);
          if (processed) childrenArray.push(processed);
        });
      }
      component.children = childrenArray;
    }

    // Handle text content
    if (node._ && typeof node._ === 'string' && node._.trim()) {
      component.text = node._.trim();
    }

    return component;
  }

  extractId(attrs) {
    if (!attrs) return null;
    const id = attrs['android:id'];
    return id ? id.replace('@+id/', '').replace('@id/', '') : null;
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
      }
    }
    return props;
  }

  mapTagName(tagName) {
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
