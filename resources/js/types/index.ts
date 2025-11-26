export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    role_id: number;
    division_id?: number;
    position_id?: number;
    profile_picture?: string;
    status: 'active' | 'inactive';
    role?: Role;
    division?: Division;
    position?: Position;
}

export interface Role {
    id: number;
    name: string;
    description?: string;
    permissions?: RolePermission[];
}

export interface RolePermission {
    id: number;
    role_id: number;
    module_name: string;
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
}

export interface Division {
    id: number;
    name: string;
    description?: string;
    users_count?: number;
    prokers_count?: number;
}

export interface Position {
    id: number;
    name: string;
    description?: string;
}

export interface Proker {
    id: number;
    division_id?: number;
    title: string;
    description?: string;
    date: string;
    location?: string;
    status: 'planned' | 'ongoing' | 'done';
    division?: Division;
    divisions?: Division[];
    media?: ProkerMedia[];
    anggota?: ProkerAnggota[];
}

export interface ProkerAnggota {
    id: number;
    proker_id: number;
    user_id: number;
    role?: string;
    user?: User;
}

export interface ProkerMedia {
    id: number;
    proker_id: number;
    media_type: 'image' | 'video';
    media_url: string;
    caption?: string;
    proker?: Proker;
}

export interface Message {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'unread' | 'read' | 'archived';
    created_at: string;
}

export interface Transaction {
    id: number;
    title: string;
    amount: number;
    type: 'income' | 'expense';
    description?: string;
    created_by: number;
    date: string;
    creator?: User;
}

export interface AppSetting {
    key: string;
    value: string;
}

export interface AuditLog {
    id: number;
    user_id?: number;
    action: string;
    description?: string;
    created_at: string;
    user?: User;
}

export interface DashboardStats {
    total_users: number;
    total_divisions: number;
    total_prokers: number;
    unread_messages: number;
    balance: number;
    total_income: number;
    total_expense: number;
    proker_status: {
        planned: number;
        ongoing: number;
        done: number;
    };
    recent_prokers: Proker[];
    recent_messages: Message[];
    users_by_division: { name: string; count: number }[];
    transaction_trend: { month: string; income: number; expense: number }[];
}
