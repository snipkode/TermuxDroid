import { Router } from 'express';
import { loadProject } from '../controllers/project.controller.js';
import { getLayout, updateLayout } from '../controllers/layout.controller.js';
import { buildProject } from '../controllers/build.controller.js';

const router = Router();

// Project endpoints
router.post('/projects/load', loadProject);

// Layout endpoints
router.get('/layouts/:id', getLayout);
router.patch('/layouts/:id', updateLayout);

// Build endpoints
router.post('/build', buildProject);

export default router;
