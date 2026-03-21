import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { readFile } from 'fs/promises';

const execAsync = promisify(exec);

const getProjectPath = () => {
  return process.env.PROJECT_PATH || join(process.cwd(), '../..');
};

export const buildProject = async (req, res) => {
  try {
    const { options = {} } = req.body;
    const { variant = 'debug', install = true, clean = false } = options;
    
    const projectPath = getProjectPath();
    
    console.log('🔨 Starting build process...');
    console.log('   Variant:', variant);
    console.log('   Install:', install);
    console.log('   Project:', projectPath);
    
    const startTime = Date.now();
    
    // Clean if requested
    if (clean) {
      console.log('🧹 Cleaning build...');
      await execAsync('./gradlew clean', { 
        cwd: projectPath,
        maxBuffer: 1024 * 1024 * 20
      });
    }
    
    // Run Gradle build
    const taskName = variant === 'debug' ? 'assembleDebug' : 'assembleRelease';
    console.log(`⚙️  Running: ./gradlew ${taskName}`);
    
    const { stdout, stderr } = await execAsync(`./gradlew ${taskName}`, { 
      cwd: projectPath,
      maxBuffer: 1024 * 1024 * 20,
      env: { ...process.env, GRADLE_OPTS: '-Xmx2g' }
    });
    
    const buildTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Build completed in ${buildTime}s`);
    
    // Determine APK path
    const apkPath = `app/build/outputs/apk/${variant}/app-${variant}.apk`;
    
    // Install to device if requested
    let installed = false;
    let installOutput = '';
    
    if (install) {
      console.log('📲 Installing APK to device...');
      try {
        const fullApkPath = join(projectPath, apkPath);
        const { stdout: installStdout } = await execAsync(`adb install -r "${fullApkPath}"`, {
          cwd: projectPath,
          maxBuffer: 1024 * 1024 * 10
        });
        installOutput = installStdout;
        installed = true;
        console.log('✅ APK installed successfully');
      } catch (installError) {
        console.warn('⚠️  Install failed:', installError.message);
        installOutput = installError.message;
      }
    }
    
    res.json({
      success: true,
      message: `Build completed in ${buildTime}s`,
      variant,
      apkPath,
      installed,
      buildTime: parseFloat(buildTime),
      output: stdout,
      installOutput: installOutput,
      errors: stderr || null
    });
    
  } catch (error) {
    console.error('❌ Build error:', error);
    
    // Try to extract useful error message from Gradle output
    let gradleError = error.message;
    if (error.stderr) {
      const errorLines = error.stderr.split('\n');
      const buildError = errorLines.find(line => 
        line.includes('error:') || line.includes('FAILURE:') || line.includes('FAILED')
      );
      if (buildError) {
        gradleError = buildError.trim();
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Build failed',
      details: gradleError,
      stderr: error.stderr,
      stdout: error.stdout
    });
  }
};

export const cleanProject = async (req, res) => {
  try {
    const projectPath = getProjectPath();
    
    console.log('🧹 Cleaning project...');
    const { stdout } = await execAsync('./gradlew clean', {
      cwd: projectPath,
      maxBuffer: 1024 * 1024 * 10
    });
    
    res.json({
      success: true,
      message: 'Project cleaned successfully',
      output: stdout
    });
    
  } catch (error) {
    console.error('Clean error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const runApp = async (req, res) => {
  try {
    const projectPath = getProjectPath();
    const { packageName } = req.body;
    
    if (!packageName) {
      return res.status(400).json({
        success: false,
        error: 'Package name is required'
      });
    }
    
    console.log(`🚀 Launching app: ${packageName}`);
    const { stdout } = await execAsync(
      `adb shell am start -n ${packageName}/.MainActivity`,
      {
        cwd: projectPath,
        maxBuffer: 1024 * 1024 * 10
      }
    );
    
    res.json({
      success: true,
      message: 'App launched successfully',
      output: stdout
    });
    
  } catch (error) {
    console.error('Run app error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
