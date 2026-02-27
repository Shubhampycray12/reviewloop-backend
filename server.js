require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { sequelize } = require('./models');
const logger = require('./utils/logger');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const internalRoutes = require('./routes/internalRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security & logging
app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Webhooks need raw body
app.use('/api/v1/webhooks', express.raw({ type: 'application/json' }));
app.use(express.json());

// API docs (Swagger)
app.get('/api-doc', (req, res) => res.redirect(301, '/api-docs/'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
  },
  customSiteTitle: 'ReviewLoop API Docs',
}));

// Routes
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/webhooks', webhookRoutes);
app.use('/api/v1/internal', internalRoutes);

// Health check
app.get('/health', (req, res) => res.send('OK'));

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    logger.info('Database connected');
    // Create tables if they don't exist. Use sync() without alter to avoid
    // "Too many keys" and other ALTER issues (e.g. duplicate indexes on admins).
    // For new columns, run a migration or manual ALTER.
    if (process.env.NODE_ENV === 'development') {
      return sequelize.sync();
    }
  })
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    logger.error('Unable to start server:', err);
    process.exit(1);
  });
