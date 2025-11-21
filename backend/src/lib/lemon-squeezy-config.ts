/**
 * Lemon Squeezy configuration module
 * 
 * Handles environment-based configuration for Lemon Squeezy integration,
 * supporting separate test and live modes.
 */

export type LemonSqueezyMode = 'test' | 'live';

export interface LemonSqueezyConfig {
  mode: LemonSqueezyMode;
  productUrl: string;
  webhookSecret: string;
  variantIds: {
    pro: string | undefined;
    enterprise: string | undefined;
  };
}

/**
 * Get Lemon Squeezy configuration based on environment
 * 
 * Reads LEMON_SQUEEZY_MODE to determine which set of env vars to use.
 * Defaults to 'test' mode if not specified.
 */
export function getLemonSqueezyConfig(): LemonSqueezyConfig {
  const mode = (process.env.LEMON_SQUEEZY_MODE || 'test') as LemonSqueezyMode;

  if (mode === 'live') {
    return {
      mode: 'live',
      productUrl: process.env.LEMON_SQUEEZY_LIVE_PRODUCT_URL || '',
      webhookSecret: process.env.LEMON_SQUEEZY_LIVE_WEBHOOK_SECRET || '',
      variantIds: {
        pro: process.env.LEMON_SQUEEZY_LIVE_PRO_VARIANT_ID,
        enterprise: process.env.LEMON_SQUEEZY_LIVE_ENTERPRISE_VARIANT_ID,
      },
    };
  }

  // Default to test mode
  return {
    mode: 'test',
    productUrl: process.env.LEMON_SQUEEZY_TEST_PRODUCT_URL || '',
    webhookSecret: process.env.LEMON_SQUEEZY_TEST_WEBHOOK_SECRET || '',
    variantIds: {
      pro: process.env.LEMON_SQUEEZY_TEST_PRO_VARIANT_ID,
      enterprise: process.env.LEMON_SQUEEZY_TEST_ENTERPRISE_VARIANT_ID,
    },
  };
}

/**
 * Get Lemon Squeezy product URL for frontend
 * 
 * Returns the appropriate product URL based on current mode.
 */
export function getLemonSqueezyProductUrl(): string {
  const config = getLemonSqueezyConfig();
  return config.productUrl;
}

