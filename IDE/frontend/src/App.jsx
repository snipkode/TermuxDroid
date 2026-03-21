import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Editor from '@pages/Editor';

function App() {
  return (
    <Box sx={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Routes>
        <Route path="/" element={<Editor />} />
        <Route path="/editor" element={<Editor />} />
      </Routes>
    </Box>
  );
}

export default App;
