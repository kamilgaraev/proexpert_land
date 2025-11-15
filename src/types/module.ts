// types/module.ts

export type ModuleDevelopmentStatus = 
  | 'stable' 
  | 'beta' 
  | 'alpha' 
  | 'development' 
  | 'coming_soon' 
  | 'deprecated';

export interface DevelopmentStatusInfo {
  status: ModuleDevelopmentStatus;
  label: string;
  description: string;
  color: 'green' | 'blue' | 'orange' | 'yellow' | 'purple' | 'red';
  icon: string;
  can_be_activated: boolean;
  should_show_warning: boolean;
  warning_message: string | null;
}

export interface Module {
  id?: number;
  slug: string;
  name: string;
  description: string;
  type: 'core' | 'addon' | 'premium' | 'feature' | 'service';
  category: string;
  billing_model: 'subscription' | 'one_time' | 'free';
  pricing_config?: {
    base_price: number;
    currency: string;
    included_in_plan?: boolean;
    duration_days: number;
  };
  // Старые поля для обратной совместимости
  price?: number;
  currency?: string;
  duration_days?: number;
  features: string[];
  permissions: string[];
  dependencies?: string[];
  conflicts?: string[];
  limits?: {
    [key: string]: any;
  };
  icon: string;
  display_order?: number;
  is_active: boolean;
  is_system_module?: boolean;
  can_deactivate?: boolean;
  is_free?: boolean;
  development_status: DevelopmentStatusInfo;
  activation: {
    activated_at: string;
    expires_at: string | null;
    status: string;
    days_until_expiration: number | null;
  } | null;
}

export interface ModulesResponse {
  success: boolean;
  data: {
    [category: string]: Module[];
  };
}

