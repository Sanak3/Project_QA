import React, { createContext, useContext, useState, useEffect } from 'react';
export const AuthContext = createContext<any>(undefined);
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState(null);
    useEffect(() => {
        const saved = localStorage.getItem('adotapet_user');
        if (saved) setUser(JSON.parse(saved));
    }, []);
    const login = async (token: string, userData: any) => {
        setUser(userData);
        localStorage.setItem('adotapet_token', token);
        localStorage.setItem('adotapet_user', JSON.stringify(userData));
    };
    const logout = () => {
        setUser(null);
        localStorage.removeItem('adotapet_token');
        localStorage.removeItem('adotapet_user');
    };
    return (
        <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
