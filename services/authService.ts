
interface User {
    username: string;
    role: 'ADUAN_MANAGER' | 'NEWS_MANAGER';
    name: string;
}

const USERS: Record<string, User & { password: string }> = {
    'admin': {
        username: 'admin',
        password: '123',
        role: 'ADUAN_MANAGER',
        name: 'Admin Pengaduan'
    },
    'berita': {
        username: 'berita',
        password: '123',
        role: 'NEWS_MANAGER',
        name: 'Admin Berita'
    }
};

export const authService = {
    login: (username: string, password: string): User | null => {
        const user = USERS[username];
        if (user && user.password === password) {
            const { password, ...userData } = user;
            localStorage.setItem('pbd_auth_user', JSON.stringify(userData));
            return userData;
        }
        return null;
    },

    logout: () => {
        localStorage.removeItem('pbd_auth_user');
        window.location.href = '/admin/login';
    },

    getCurrentUser: (): User | null => {
        const stored = localStorage.getItem('pbd_auth_user');
        return stored ? JSON.parse(stored) : null;
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('pbd_auth_user');
    },

    // Helper to check if user has access to a specific role feature
    hasAccess: (requiredRole: 'ADUAN_MANAGER' | 'NEWS_MANAGER'): boolean => {
        const user = authService.getCurrentUser();
        return user?.role === requiredRole;
    }
};
