import app from './src/app.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set project root (TermuxDroid project path)
process.env.PROJECT_PATH = join(__dirname, '../..');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🎨 GUI Builder Backend running on http://localhost:${PORT}`);
  console.log(`📁 Project Path: ${process.env.PROJECT_PATH}`);
});
