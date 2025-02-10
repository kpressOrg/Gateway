const proxy = require("express-http-proxy");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

dotenv.config();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json("API Gateway is running");
});

const setupProxy = (path, url) => {
  app.use(
    `/api/${process.env.API_VERSION}/${path}`,
    proxy(url, {
      proxyReqPathResolver: (req) => {
        console.log(`Proxying request to ${path}-service: ${req.method} ${req.url}`);
        return req.url;
      },
      proxyErrorHandler: (err, res, next) => {
        console.error(`Error proxying request to ${path}-service: ${err.message}`);
        res.status(500).json({ error: "Proxy error" });
      },
      timeout: 5000, // 5 seconds timeout
    })
  );
};

setupProxy("todos", process.env.TODO_URL);
setupProxy("posts", process.env.POST_URL);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});