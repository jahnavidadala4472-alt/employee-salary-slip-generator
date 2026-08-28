const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');

const startServer = async () => {
  // Connect Database
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Payroll Server running in ${env.NODE_ENV} mode`);
    console.log(`📡 URL: http://localhost:${env.PORT}`);
    console.log(`📄 Static Client: http://localhost:${env.PORT}/index.html`);
    console.log(`====================================================`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`[Unhandled Rejection] ${err.message}`);
  });
};

startServer();
