/**
 * Validation script to check WebSocket server setup
 *
 * Run this before starting the server to ensure all dependencies are configured
 */

import { getRedisPubSub } from '../redis/pubsub';
import { prisma } from '@fantasy-madness/db';

type ValidationResult = {
  component: string;
  status: 'ok' | 'error' | 'warning';
  message: string;
  details?: string;
};

async function validateEnvironment(): Promise<ValidationResult> {
  const required = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const optional = [
    'REDIS_URL',
    'PORT',
    'HOSTNAME',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    return {
      component: 'Environment',
      status: 'error',
      message: 'Missing required environment variables',
      details: missing.join(', '),
    };
  }

  const missingOptional = optional.filter(key => !process.env[key]);
  if (missingOptional.length > 0) {
    return {
      component: 'Environment',
      status: 'warning',
      message: 'Missing optional environment variables (using defaults)',
      details: missingOptional.join(', '),
    };
  }

  return {
    component: 'Environment',
    status: 'ok',
    message: 'All required environment variables present',
  };
}

async function validateDatabase(): Promise<ValidationResult> {
  try {
    await prisma.$queryRaw`SELECT 1`;

    // Check for DraftTurnTimer table
    const result = await prisma.$queryRaw<any[]>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'draft_turn_timers'
      ) as exists
    `;

    if (!result[0]?.exists) {
      return {
        component: 'Database',
        status: 'error',
        message: 'draft_turn_timers table not found',
        details: 'Run database migrations: npm run migrate:dev -w @fantasy-madness/db',
      };
    }

    return {
      component: 'Database',
      status: 'ok',
      message: 'Database connection successful',
    };
  } catch (err) {
    return {
      component: 'Database',
      status: 'error',
      message: 'Database connection failed',
      details: err instanceof Error ? err.message : String(err),
    };
  }
}

async function validateRedis(): Promise<ValidationResult> {
  try {
    const redis = getRedisPubSub();

    // Try to publish and subscribe
    let received = false;
    const testChannel = '__test_channel__';
    const testMessage = { test: true, timestamp: Date.now() };

    await redis.subscribe(testChannel, (msg) => {
      if (JSON.stringify(msg) === JSON.stringify(testMessage)) {
        received = true;
      }
    });

    await redis.publish(testChannel, testMessage);

    // Wait a bit for message
    await new Promise(resolve => setTimeout(resolve, 100));

    await redis.unsubscribe(testChannel, () => {});

    if (!received) {
      return {
        component: 'Redis',
        status: 'warning',
        message: 'Redis pub/sub may not be working correctly',
        details: 'Test message was not received',
      };
    }

    return {
      component: 'Redis',
      status: 'ok',
      message: 'Redis pub/sub working correctly',
    };
  } catch (err) {
    return {
      component: 'Redis',
      status: 'error',
      message: 'Redis connection failed',
      details: err instanceof Error ? err.message : String(err),
    };
  }
}

async function validateWebSocketDependencies(): Promise<ValidationResult> {
  try {
    // Check if ws module is available
    await import('ws');

    // Check if @supabase/ssr is available
    await import('@supabase/ssr');

    return {
      component: 'Dependencies',
      status: 'ok',
      message: 'All WebSocket dependencies installed',
    };
  } catch (err) {
    return {
      component: 'Dependencies',
      status: 'error',
      message: 'Missing required dependencies',
      details: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Run all validations
 */
export async function validateSetup(): Promise<{
  success: boolean;
  results: ValidationResult[];
}> {
  console.log('🔍 Validating WebSocket server setup...\n');

  const results: ValidationResult[] = [];

  // Run validations
  results.push(await validateEnvironment());
  results.push(await validateWebSocketDependencies());
  results.push(await validateDatabase());
  results.push(await validateRedis());

  // Print results
  for (const result of results) {
    const icon = result.status === 'ok' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${result.component}: ${result.message}`);
    if (result.details) {
      console.log(`   ${result.details}`);
    }
  }

  const hasErrors = results.some(r => r.status === 'error');
  const hasWarnings = results.some(r => r.status === 'warning');

  console.log();
  if (hasErrors) {
    console.log('❌ Validation failed. Please fix the errors above before starting the server.');
  } else if (hasWarnings) {
    console.log('⚠️  Validation passed with warnings. Server may not function optimally.');
  } else {
    console.log('✅ All validations passed! WebSocket server is ready to start.');
  }

  return {
    success: !hasErrors,
    results,
  };
}

// Run if called directly
if (require.main === module) {
  validateSetup()
    .then(({ success }) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error('Validation error:', err);
      process.exit(1);
    });
}
