import express from 'express';
import dotenv from 'dotenv';
import distanceRoute from './routes/distance.route.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// recreate __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(cors());

app.use('/api/distance', distanceRoute);

app.listen(process.env.PORT, () => {
	console.log(`🚀 Server running on port ${process.env.PORT}`);
});
