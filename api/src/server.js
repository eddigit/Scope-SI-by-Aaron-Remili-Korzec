import { createDb, createPoolFromEnv } from "./db.js";
import { createApp } from "./http-app.js";

const port = Number(process.env.PORT || 3000);
const pool = createPoolFromEnv();
const app = createApp({ db: createDb(pool) });

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`infoscope-api listening on ${port}`);
});

async function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

