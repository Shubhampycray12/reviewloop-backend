/**
 * OpenAPI 3.0 spec for ReviewLoop Backend
 * Served at /api-docs
 */
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'ReviewLoop API',
      version: '1.0.0',
      description: `ReviewLoop SaaS backend – public, admin, webhooks, and internal APIs.

**Testing admin endpoints:**  
1. Call **POST /api/v1/admin/auth/login** (or **/auth/register** for first-time) with email and password.  
2. Copy the \`token\` from the response.  
3. Click the **Authorize** button (🔓 at the top right of this page).  
4. Paste the token into the "Value" field (paste only the JWT string; do not type "Bearer").  
5. Click **Authorize**, then **Close**. Lock icons (🔒) on admin endpoints will now send this token.`,
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local' },
      { url: '/', description: 'Current host' },
      { url: 'https://reviewloop-backend.onrender.com/', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Admin JWT from POST /api/v1/admin/auth/login or /auth/register',
        },
        internalApiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'x-internal-api-key',
          description: 'Internal job runner API key',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          tags: ['Health'],
          responses: { 200: { description: 'OK' } },
        },
      },

      // ========== Public API ==========
      '/api/v1/public/plans': {
        get: {
          summary: 'List plans',
          tags: ['Public – Plans'],
          responses: { 200: { description: 'List of plans' } },
        },
      },
      '/api/v1/public/customers/check-lead': {
        post: {
          summary: 'Check lead (WhatsApp)',
          tags: ['Public – Customers'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['whatsapp_phone'],
                  properties: { whatsapp_phone: { type: 'string', example: '+919876543210' } },
                },
              },
            },
          },
          responses: { 200: { description: 'Lead check result' } },
        },
      },
      '/api/v1/public/customers/initiate': {
        post: {
          summary: 'Initiate customer',
          tags: ['Public – Customers'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['business_name', 'owner_name', 'whatsapp_phone', 'plan_code'],
                  properties: {
                    business_name: { type: 'string', example: 'Acme Store' },
                    owner_name: { type: 'string', example: 'John Doe' },
                    whatsapp_phone: { type: 'string', example: '+919876543210', description: 'E.164 format (e.g. +919876543210)' },
                    email: { type: 'string', format: 'email', example: 'owner@acme.com' },
                    plan_code: { type: 'string', enum: ['PHYSICAL_KIT', 'STARTER_MONTHLY'] },
                  },
                },
                example: {
                  business_name: 'Acme Store',
                  owner_name: 'John Doe',
                  whatsapp_phone: '+919876543210',
                  email: 'owner@acme.com',
                  plan_code: 'PHYSICAL_KIT',
                },
              },
            },
          },
          responses: { 200: { description: 'Customer initiated' } },
        },
      },
      '/api/v1/public/payments/test-orders': {
        get: {
          summary: 'List orders with gateway_order_id (dev only)',
          tags: ['Public – Payments'],
          description: 'Only when ALLOW_WEBHOOK_DEV_BYPASS=1. Returns orders that have a Razorpay gateway_order_id so you can copy one for webhook testing. If empty, create one via: 1) POST customers/initiate, 2) POST payments/create-order.',
          responses: { 200: { description: 'List of orders with gateway_order_id' } },
        },
      },
      '/api/v1/public/payments/create-order': {
        post: {
          summary: 'Create payment order (get gateway_order_id)',
          tags: ['Public – Payments'],
          description: 'Call this with customer_id and order_id from **POST /customers/initiate**. Response includes gateway_order_id — use that in the Razorpay webhook as payload.payment.entity.order_id.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['customer_id', 'order_id'],
                  properties: {
                    customer_id: { type: 'integer', example: 1 },
                    order_id: { type: 'integer', example: 1 },
                  },
                },
                example: { customer_id: 1, order_id: 1 },
              },
            },
          },
          responses: { 200: { description: 'Order created; use data.gateway_order_id in webhook' } },
        },
      },
      '/api/v1/public/customers/onboarding-details': {
        post: {
          summary: 'Submit onboarding details',
          tags: ['Public – Onboarding'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['customer_id'],
                  properties: { customer_id: { type: 'integer', example: 1 } },
                },
                example: { customer_id: 1 },
              },
            },
          },
          responses: { 200: { description: 'Details submitted' } },
        },
      },
      '/api/v1/public/profile/connect': {
        get: {
          summary: 'Start OAuth (Google profile connect)',
          tags: ['Public – OAuth'],
          description: 'Use return_url=1 to get the OAuth URL in JSON (for Swagger / API clients). Without it, responds with 302 redirect to Google.',
          parameters: [
            { name: 'customer_id', in: 'query', required: true, schema: { type: 'integer', example: 1 }, description: 'Customer to link the Google profile to' },
            { name: 'return_url', in: 'query', required: false, schema: { type: 'string', enum: ['1', 'true'] }, description: 'If 1 or true, return 200 with { url } instead of redirecting (avoids CORS in Swagger)' },
          ],
          responses: {
            200: {
              description: 'OAuth URL (when return_url=1)',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      url: { type: 'string', example: 'https://accounts.google.com/o/oauth2/v2/auth?...' },
                    },
                  },
                },
              },
            },
            302: { description: 'Redirect to OAuth provider (when return_url not set)' },
            400: { description: 'customer_id required' },
          },
        },
      },
      '/api/v1/public/profile/callback': {
        get: {
          summary: 'OAuth callback',
          tags: ['Public – OAuth'],
          description: 'Called by Google after user authorizes. code and state are set by Google; do not call with arbitrary values.',
          parameters: [
            { name: 'code', in: 'query', required: true, schema: { type: 'string' }, description: 'Auth code from Google' },
            { name: 'state', in: 'query', required: true, schema: { type: 'string' }, description: 'Base64-encoded state (from /profile/connect)' },
          ],
          responses: {
            302: { description: 'Redirect to frontend success URL' },
            400: { description: 'Missing code/state or invalid state' },
          },
        },
      },
      '/api/v1/public/customers/complete-onboarding': {
        post: {
          summary: 'Complete onboarding',
          tags: ['Public – Onboarding'],
          description: 'Marks customer as ACTIVE. For **STARTER_MONTHLY** customers, Google Business Profile must be connected first (GET /profile/connect?customer_id=…). For testing without OAuth, set ALLOW_SKIP_PROFILE_CONNECTION=1 in .env.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['customer_id'],
                  properties: { customer_id: { type: 'integer', example: 1 } },
                },
                example: { customer_id: 1 },
              },
            },
          },
          responses: {
            200: { description: 'Onboarding completed' },
            400: { description: 'Profile connection required (connect Google first)' },
            404: { description: 'Customer not found' },
          },
        },
      },
      '/api/v1/public/customers/{customer_id}/status': {
        get: {
          summary: 'Get customer onboarding status',
          tags: ['Public – Onboarding'],
          parameters: [
            { name: 'customer_id', in: 'path', required: true, schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'Status' } },
        },
      },

      // ========== Admin API ==========
      '/api/v1/admin/auth/register': {
        post: {
          summary: 'Create first admin account',
          tags: ['Admin – Auth'],
          description: 'Only works when no admin exists. Use this once to create your login account, then use /auth/login.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'admin@example.com' },
                    password: { type: 'string', example: 'YourSecurePassword123!', minLength: 6 },
                  },
                },
                example: { email: 'admin@example.com', password: 'YourSecurePassword123!' },
              },
            },
          },
          responses: {
            201: { description: 'Admin created and logged in; returns token' },
            400: { description: 'Validation error (invalid email or missing password)' },
            403: { description: 'An admin already exists' },
            409: { description: 'Email already registered' },
          },
        },
      },
      '/api/v1/admin/auth/login': {
        post: {
          summary: 'Admin login',
          tags: ['Admin – Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'admin@example.com' },
                    password: { type: 'string', example: 'YourSecurePassword123!' },
                  },
                },
                example: { email: 'admin@example.com', password: 'YourSecurePassword123!' },
              },
            },
          },
          responses: { 200: { description: 'Token and admin info' }, 401: { description: 'Invalid credentials' } },
        },
      },
      '/api/v1/admin/auth/logout': {
        post: {
          summary: 'Admin logout',
          tags: ['Admin – Auth'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Logged out' } },
        },
      },
      '/api/v1/admin/auth/me': {
        get: {
          summary: 'Current admin',
          tags: ['Admin – Auth'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Admin profile' } },
        },
      },
      '/api/v1/admin/customers': {
        get: {
          summary: 'List customers',
          tags: ['Admin – Customers'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of customers' } },
        },
      },
      '/api/v1/admin/customers/{customer_id}': {
        get: {
          summary: 'Get customer',
          tags: ['Admin – Customers'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'customer_id', in: 'path', required: true, schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'Customer' } },
        },
        patch: {
          summary: 'Update customer',
          tags: ['Admin – Customers'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'customer_id', in: 'path', required: true, schema: { type: 'integer' } },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {},
                },
              },
            },
          },
          responses: { 200: { description: 'Updated customer' } },
        },
      },
      '/api/v1/admin/reports': {
        get: {
          summary: 'List reports',
          tags: ['Admin – Reports'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of reports' } },
        },
      },
      '/api/v1/admin/reports/{report_id}': {
        get: {
          summary: 'Get report',
          tags: ['Admin – Reports'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'report_id', in: 'path', required: true, schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'Report' } },
        },
      },
      '/api/v1/admin/reports/{report_id}/summary': {
        post: {
          summary: 'Upsert report summary',
          tags: ['Admin – Reports'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'report_id', in: 'path', required: true, schema: { type: 'integer' } },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    summary: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Summary saved' } },
        },
      },
      '/api/v1/admin/reports/{report_id}/send-whatsapp': {
        post: {
          summary: 'Send report via WhatsApp',
          tags: ['Admin – Messages'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'report_id', in: 'path', required: true, schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'Message sent' } },
        },
      },
      '/api/v1/admin/message-logs': {
        get: {
          summary: 'List message logs',
          tags: ['Admin – Messages'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of message logs' } },
        },
      },
      '/api/v1/admin/customers/{customer_id}/subscriptions/cancel': {
        post: {
          summary: 'Cancel customer subscription',
          tags: ['Admin – Subscriptions'],
          description: 'Subscriptions exist only for customers who paid for **STARTER_MONTHLY** (created automatically when the Razorpay webhook receives payment.captured for an order with order_type STARTER_SETUP). Customers with PHYSICAL_KIT only have no subscription.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'customer_id', in: 'path', required: true, schema: { type: 'integer' } },
          ],
          responses: {
            200: { description: 'Subscription cancelled' },
            404: { description: 'No active subscription for this customer' },
          },
        },
      },

      // ========== Webhooks ==========
      '/api/v1/webhooks/payments/razorpay': {
        post: {
          summary: 'Razorpay payment webhook',
          tags: ['Webhooks'],
          description: `Called by Razorpay when a payment is captured or fails.

**Testing from Swagger:** Set \`ALLOW_WEBHOOK_DEV_BYPASS=1\` in .env. Then: (1) **POST /customers/initiate** → get \`customer_id\`, \`order_id\`. (2) **POST /payments/create-order** with those ids → get \`gateway_order_id\`. (3) Call this webhook with \`payload.payment.entity.order_id\` = that \`gateway_order_id\`. Or **GET /payments/test-orders** to list valid gateway_order_ids.

**Production:** Razorpay sends \`x-razorpay-signature\` (HMAC of body with RAZORPAY_WEBHOOK_SECRET). Do not set ALLOW_WEBHOOK_DEV_BYPASS in production.`,
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['event', 'payload'],
                  properties: {
                    event: { type: 'string', example: 'payment.captured' },
                    payload: {
                      type: 'object',
                      properties: {
                        payment: {
                          type: 'object',
                          properties: {
                            entity: {
                              type: 'object',
                              required: ['id', 'order_id'],
                              properties: {
                                id: { type: 'string', description: 'Razorpay payment id' },
                                order_id: { type: 'string', description: 'Razorpay order id (= gateway_order_id in orders table)' },
                                status: { type: 'string', example: 'captured' },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                example: {
                  event: 'payment.captured',
                  payload: {
                    payment: {
                      entity: {
                        id: 'pay_test123',
                        order_id: 'order_xxx',
                        status: 'captured',
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Webhook processed' },
            400: { description: 'Missing x-razorpay-signature (or invalid signature/payload)' },
            503: { description: 'RAZORPAY_WEBHOOK_SECRET not set when signature is sent' },
          },
        },
      },

      // ========== Internal (jobs) ==========
      '/api/v1/internal/jobs/review-pull': {
        post: {
          summary: 'Run review pull job',
          tags: ['Internal'],
          security: [{ internalApiKey: [] }],
          responses: { 200: { description: 'Job run' } },
        },
      },
      '/api/v1/internal/jobs/report-build': {
        post: {
          summary: 'Run report build job',
          tags: ['Internal'],
          security: [{ internalApiKey: [] }],
          responses: { 200: { description: 'Job run' } },
        },
      },
      '/api/v1/internal/jobs/renewal-check': {
        post: {
          summary: 'Run renewal check job',
          tags: ['Internal'],
          security: [{ internalApiKey: [] }],
          responses: { 200: { description: 'Job run' } },
        },
      },
    },
  },
  apis: [], // no JSDoc scanning; spec is above
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
