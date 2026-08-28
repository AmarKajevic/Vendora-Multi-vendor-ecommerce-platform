/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import router from './routes/seller.routes';
import { errorMiddleware } from '@packages/error-handler/error-middlware';
import cookieParser from "cookie-parser"

const app = express();
app.use(express.json())
app.use(cookieParser())




app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to seller-service!' });
});
app.use("/api", router)

app.use(errorMiddleware)

const port = process.env.PORT || 6003;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
