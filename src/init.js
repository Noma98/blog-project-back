import 'dotenv/config';
import app from './server.js';
import './db.js';
import config from './config/config.js';

const PORT = config.port;
app.listen(PORT, () => console.log(`✅ Server listening on port ${PORT}`));