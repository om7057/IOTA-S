const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const queryRoutes = require('./routes/queries');
const groupRoutes = require('./routes/groups');
const topicRoutes = require('./routes/topics');
const commentRoutes = require('./routes/comments');
const likeRoutes = require('./routes/likes');
const analysisRoutes = require('./routes/analysis');
const journalRoutes = require('./routes/journal');

const supabase = require('./config/supabase'); 

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be defined in .env');
  process.exit(1);
}

app.use(cors());
app.use(express.json());  

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/journal', journalRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
