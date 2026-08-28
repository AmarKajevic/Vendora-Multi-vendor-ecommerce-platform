/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
import cors from 'cors';
import proxy from 'express-http-proxy';
import morgan from "morgan"
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import initializeSiteConfig from './libs/initializeSiteConfig';





const app = express();


app.use(cors({
  origin: ["http://localhost:3000","http://localhost:3001","http://localhost:3002"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
})
);

app.use(morgan("dev"));
app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cookieParser());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.set('trust proxy', 1);

//Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req:any) => (req.user ? 1000 : 100),
  message: {error: 'Too many requests, please try again later.'},
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req: any) => req.ip
});


app.use(limiter);
app.use("/recommendation", proxy('http://localhost:6007', ));

app.use("/chatting", proxy('http://localhost:6006', ));

app.use("/admin", proxy('http://localhost:6005', ));

app.use("/order", proxy('http://localhost:6004', ));
app.use("/seller", proxy('http://localhost:6003', ));
app.use("/product", proxy('http://localhost:6002', ));
app.use("/", proxy('http://localhost:6001', ));



app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  try {
    initializeSiteConfig();
    console.log("site config initalized successfully")
  } catch (error) {
    console.log("failed to initialize site config", error)
  }
});
server.on('error', console.error);
