import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import routes from './routes/index.js';
import { env } from './config/env.js';
import { requestLogger } from './config/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { requestContext } from './middleware/requestContext.js';

export const app = express();

const captureRawJsonBody = (req, _res, buffer) => {
	if (buffer?.length) {
		req.rawBody = Buffer.from(buffer);
	}
};

const corsOrigin = env.nodeEnv === 'development' && env.corsOrigin === 'http://localhost:3000'
	? [env.corsOrigin, 'http://localhost:3001']
	: env.corsOrigin;

app.use(helmet());
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '2mb', verify: captureRawJsonBody }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(requestContext);

app.use(env.apiPrefix, routes);

app.use(notFound);
app.use(errorHandler);

export default app;