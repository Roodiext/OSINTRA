import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    flash?: {
        permission_message?: string;
        permission_denied?: boolean;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    role?: Role;
    angkatan_id?: number;
    angkatan?: Angkatan | string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Angkatan {
    id: number;
    name: string;
    year?: string;
    description?: string;
    status?: 'active' | 'inactive';
    users_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Role {
    id: number;
    name: string;
    description?: string;
    // Add other role properties if needed
}
