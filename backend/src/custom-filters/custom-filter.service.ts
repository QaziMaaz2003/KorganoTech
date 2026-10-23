import { Injectable } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service.js';
import {
  priceSpec,
  sanitizeConfig,
  validateSpec,
  type CustomFilterConfig,
  type CustomQuote,
  type CustomSpec,
} from './custom-filter.config.js';

@Injectable()
export class CustomFilterService {
  constructor(private readonly settings: SettingsService) {}

  /** The effective rules: admin settings merged over the defaults. */
  async getConfig(): Promise<CustomFilterConfig> {
    const s = await this.settings.get();
    return sanitizeConfig(s.customFilter);
  }

  /** Validates and prices a spec against the current rules. */
  async quote(spec: CustomSpec, config?: CustomFilterConfig): Promise<CustomQuote> {
    const cfg = config ?? (await this.getConfig());
    return priceSpec(validateSpec(spec, cfg), cfg);
  }

  /** What the storefront needs to build the order form (no price formula). */
  async getPublicConfig() {
    const cfg = await this.getConfig();
    return {
      enabled: cfg.enabled,
      minDimension: cfg.minDimension,
      maxDimension: cfg.maxDimension,
      step: cfg.step,
      depths: cfg.depths,
      mervRatings: cfg.mervRatings,
      packs: cfg.packs.map((p) => ({ quantity: p.quantity, discount: p.discount })),
      leadTimeNote: cfg.leadTimeNote,
    };
  }
}
