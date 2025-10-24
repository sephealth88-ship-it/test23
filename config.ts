/**
 * ===================================================================
 * APPLICATION CONFIGURATION
 * ===================================================================
 * This file contains the configuration for the n8n workflow endpoint.
 *
 * IMPORTANT: This URL should point to your initial n8n 'Webhook' trigger node.
 * The workflow will respond with a unique 'resumeUrl' which the application
 * will then use to upload the file to the 'Wait' node.
 * ===================================================================
 */

export const N8N_WEBHOOK_URL = 'https://sep123.app.n8n.cloud/webhook/REDACTED';
export const N8N_CHECKER_URL = 'https://sep123.app.n8n.cloud/webhook/Checker';
export const N8N_SYSTEM_INPUT_URL = 'https://sep123.app.n8n.cloud/webhook/Systeminput';