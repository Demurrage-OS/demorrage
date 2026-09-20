import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('8000'),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string(),
  SESSION_SECRET: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
  RESEND_API_KEY: z.string(),
  EMAIL_FROM: z.string().default('onboarding@resend.dev'),
  INTERNAL_SERVICE_KEY: z.string(),
  FRONTEND_URL: z.string().default('http://localhost:3005'),
  AI_SERVICE_URL: z.string().optional(),
  STORAGE_TYPE: z.enum(['local', 's3']).default('local'),
  STORAGE_LOCAL_PATH: z.string().default('./uploads'),
  NOTIFICATION_PROVIDER: z.enum(['mock', 'email', 'sms']).default('mock'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  API_BASE_URL: z.string().default('http://localhost:3000'),
  SENTRY_DSN: z.string().optional(),
});

export type Environment = z.infer<typeof envSchema>;

export function loadEnvironment(): Environment {
  const env = process.env as Record<string, string>;

  try {
    return envSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
    }
    throw new Error('Invalid environment configuration');
  }
}

export const env = loadEnvironment();
