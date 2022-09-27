import express from 'express';
import openapiUi from 'swagger-ui-express';
import openapiFile from '../../../openapi.json';

const router = express.Router();

router.use('/', openapiUi.serve, openapiUi.setup(openapiFile));

export default router;
