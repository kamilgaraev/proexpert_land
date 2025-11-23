export type ProjectStatus = 'planned' | 'active' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

export type ProjectOrganizationRole =
  | 'owner'
  | 'customer'
  | 'general_contractor'
  | 'contractor'
  | 'subcontractor'
  | 'construction_supervision'
  | 'designer'
  | 'observer';

export interface ProjectRole {
    value: ProjectOrganizationRole;
    label: string;
}

// Base interface for shared fields
export interface ProjectBase {
    id: number;
    name: string;
    address?: string;
    status: ProjectStatus;
    role: ProjectRole | ProjectOrganizationRole; // Handle both formats just in case
    is_owner: boolean;
}

// List View Interface
export interface ProjectOverview extends ProjectBase {
    description?: string;
    progress_percent?: number;
    completion_percentage?: number; // Fallback
    
    // Stats for the list card
    stats?: {
        contracts: {
            total: number;
            my?: number;
            total_amount?: number;
            my_amount?: number;
        };
        works: {
            total: number;
            my?: number;
            total_amount?: number;
            my_amount?: number;
        };
    };
    
    // Legacy/Fallback fields support
    total_contracts?: number;
    total_works?: number;
    total_amount_contracts?: number;
    total_amount_works?: number;
}

// Detailed View Interface
export interface ProjectDetails extends ProjectBase {
    description?: string;
    dates?: {
        start?: string;
        end?: string;
    };
    // Fallback dates
    start_date?: string;
    end_date?: string;

    progress: {
        percent: number;
        health: 'healthy' | 'warning' | 'critical';
        next_milestone?: {
            title: string;
            date: string;
        } | null;
    };

    stats: {
        contracts: {
            total_amount: number;
            my_amount: number;
            count?: number; // Optional count
        };
        works: {
            total_amount: number;
            my_amount: number;
            count?: number; // Optional count
        };
    };

    tasks_summary: {
        total: number;
        open: number;
        completed: number;
        overdue: number;
    };

    participants: {
        total: number;
        list: Array<{
            id: number;
            name: string;
            role_label: string;
            logo?: string;
            organization_name?: string;
        }>;
    };
}

export interface MyProjectsResponse {
    success: boolean;
    data: ProjectOverview[];
}

export interface ProjectDetailsResponse {
    success: boolean;
    data: ProjectDetails;
}
