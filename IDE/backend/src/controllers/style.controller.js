import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const getProjectPath = () => {
  return process.env.PROJECT_PATH || join(process.cwd(), '../..');
};

export const updateButtonStyle = async (req, res) => {
  try {
    const { style } = req.body;

    if (!style || typeof style !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Button style configuration is required'
      });
    }

    const projectPath = getProjectPath();
    const themesPath = join(projectPath, 'app/src/main/res/values/themes.xml');
    const colorsPath = join(projectPath, 'app/src/main/res/values/colors.xml');
    const layoutPath = join(projectPath, 'app/src/main/res/layout/activity_main.xml');

    console.log('Updating Android button styles...');

    // Update themes.xml with button style
    let themesContent = await readFile(themesPath, 'utf-8');

    // Generate button style attributes
    const buttonStyleItems = [];
    
    if (style.cornerRadius) {
      buttonStyleItems.push(`        <item name="cornerRadius">${style.cornerRadius}dp</item>`);
    }
    if (style.backgroundColor) {
      buttonStyleItems.push(`        <item name="backgroundTint">${style.backgroundColor}</item>`);
    }
    if (style.textColor) {
      buttonStyleItems.push(`        <item name="android:textColor">${style.textColor}</item>`);
    }
    if (style.textAllCaps !== undefined) {
      buttonStyleItems.push(`        <item name="android:textAllCaps">${style.textAllCaps ? 'true' : 'false'}</item>`);
    }
    if (style.textSize) {
      buttonStyleItems.push(`        <item name="android:textSize">${style.textSize}sp</item>`);
    }
    if (style.elevation) {
      buttonStyleItems.push(`        <item name="android:elevation">${style.elevation}dp</item>`);
    }

    const buttonStyle = `    <!-- Button style -->
    <style name="Theme.MyApp.Button" parent="Widget.MaterialComponents.Button">
${buttonStyleItems.join('\n')}
    </style>`;

    // Match button style block - handle multiline XML properly
    const buttonStyleRegex = /<!-- Button style -->\s*<style name="Theme\.MyApp\.Button"[^>]*>[\s\S]*?<\/style>/;

    if (buttonStyleRegex.test(themesContent)) {
      themesContent = themesContent.replace(buttonStyleRegex, buttonStyle);
    } else {
      // Insert before closing </resources> tag
      themesContent = themesContent.replace('</resources>', buttonStyle + '\n</resources>');
    }

    await writeFile(themesPath, themesContent, 'utf-8');

    // Update colors.xml if custom colors provided
    if (style.customColors) {
      let colorsContent = await readFile(colorsPath, 'utf-8');
      
      for (const [colorName, colorValue] of Object.entries(style.customColors)) {
        const colorRegex = new RegExp(`<color name="${colorName}">[^<]*</color>`, 'g');
        const newColorTag = `<color name="${colorName}">${colorValue}</color>`;
        
        if (colorRegex.test(colorsContent)) {
          colorsContent = colorsContent.replace(colorRegex, newColorTag);
        } else {
          // Add new color before closing </resources> tag
          colorsContent = colorsContent.replace('</resources>', `    ${newColorTag}\n</resources>`);
        }
      }
      
      await writeFile(colorsPath, colorsContent, 'utf-8');
    }

    // Update layout XML if button properties provided
    if (style.buttons) {
      let layoutContent = await readFile(layoutPath, 'utf-8');
      
      for (const [buttonId, buttonProps] of Object.entries(style.buttons)) {
        const buttonRegex = new RegExp(
          `(<[^>]*android:id="@id/${buttonId}"[^>]*)(>)`,
          'gs'
        );
        
        const match = layoutContent.match(buttonRegex);
        if (match) {
          let buttonTag = match[0];
          
          if (buttonProps.cornerRadius) {
            if (buttonTag.includes('app:cornerRadius')) {
              buttonTag = buttonTag.replace(
                /app:cornerRadius="[^"]*"/,
                `app:cornerRadius="${buttonProps.cornerRadius}dp"`
              );
            } else {
              buttonTag = buttonTag.replace(
                />/,
                ` app:cornerRadius="${buttonProps.cornerRadius}dp" />`
              );
            }
          }
          
          if (buttonProps.style) {
            if (buttonProps.style === 'outlined') {
              buttonTag = buttonTag.replace(
                /style="[^"]*"/,
                'style="@style/Widget.MaterialComponents.Button.OutlinedButton"'
              );
            } else if (buttonProps.style === 'text') {
              buttonTag = buttonTag.replace(
                /style="[^"]*"/,
                'style="@style/Widget.MaterialComponents.Button.TextButton"'
              );
            } else if (buttonProps.style === 'contained') {
              buttonTag = buttonTag.replace(
                /style="[^"]*"/,
                'style="@style/Widget.MaterialComponents.Button"'
              );
            }
          }
          
          layoutContent = layoutContent.replace(match[0], buttonTag);
        }
      }
      
      await writeFile(layoutPath, layoutContent, 'utf-8');
    }

    console.log('Button styles updated successfully');

    res.json({
      success: true,
      message: 'Android button styles updated successfully',
      style,
      files: {
        themes: themesPath,
        colors: colorsPath,
        layout: layoutPath
      }
    });

  } catch (error) {
    console.error('Update button style error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
