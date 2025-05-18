import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { router } from './router.js';
import { config } from 'dotenv';

// Load environment variables
config();

const app = express();

// Enable CORS
app.use(cors());

// Create tRPC middleware
const trpcMiddleware = createExpressMiddleware({
  router,
});

// Use tRPC middleware
app.use('/trpc', trpcMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`tRPC endpoints available at http://localhost:${PORT}/trpc`);
}); 