import 'dotenv/config';
import app from './server.js';
import './db.js';

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server listening on port ${PORT}`));