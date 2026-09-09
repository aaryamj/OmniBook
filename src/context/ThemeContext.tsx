import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import axios from 'axios';
import { applyTheme, generateThemeTokens, isTenantThemeRoute, activateTenantThemeScope } from '../utils/themeEngine';
import type { ThemeTokens } from '../utils/themeEngine';

interface ThemeContextType {
    primaryAccentColor: string;
    tokens: ThemeTokens;
    setPrimaryAccentColor: (color: string) => void;
    saveTheme: (color: string) => Promise<boolean>;
    isSaving: boolean;
}

const DEFAULT_COLOR = '#003fb1';

const ThemeContext = createContext<ThemeContextType>({
    primaryAccentColor: DEFAULT_COLOR,
    tokens: generateThemeTokens(DEFAULT_COLOR),
    setPrimaryAccentColor: () => {},
    saveTheme: async () => false,
    isSaving: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const [primaryAccentColor, setPrimaryColorState] = useState<string>(() => {
        return localStorage.getItem('primaryAccentColor') || DEFAULT_COLOR;
    });
    const [tokens, setTokens] = useState<ThemeTokens>(() => generateThemeTokens(primaryAccentColor));
    const [isSaving, setIsSaving] = useState(false);

    // Route-aware scope toggler: strictly activate only on Admin and Provider routes
    useEffect(() => {
        const isThemed = isTenantThemeRoute(location.pathname);
        if (isThemed) {
            const savedColor = localStorage.getItem('primaryAccentColor') || DEFAULT_COLOR;
            const newTokens = applyTheme(savedColor);
            setTokens(newTokens);
            activateTenantThemeScope(true);
        } else {
            activateTenantThemeScope(false);
        }
    }, [location.pathname]);

    // Sync with backend on mount if user is authenticated and on an admin/provider page
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        axios.get('http://localhost:8080/api/v1/tenant/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            if (res.data?.primaryAccentColor) {
                const fetchedColor = res.data.primaryAccentColor;
                setPrimaryColorState(fetchedColor);
                const newTokens = applyTheme(fetchedColor);
                setTokens(newTokens);
                if (isTenantThemeRoute(location.pathname)) {
                    activateTenantThemeScope(true);
                }
            }
        })
        .catch(err => {
            // Silently fall back if not in a tenant context (e.g. public pages or superadmin)
            console.debug("Could not fetch tenant branding", err?.response?.status);
        });
    }, [location.pathname]);

    // Live preview updater (updates DOM CSS variables in real time)
    const setPrimaryAccentColor = (color: string) => {
        setPrimaryColorState(color);
        const newTokens = applyTheme(color);
        setTokens(newTokens);
    };

    // Persist to backend and update localStorage
    const saveTheme = async (color: string): Promise<boolean> => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await axios.put('http://localhost:8080/api/v1/tenant/branding', 
                    { primaryAccentColor: color },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            setPrimaryAccentColor(color);
            return true;
        } catch (error) {
            console.error("Failed to save institutional branding", error);
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ThemeContext.Provider value={{ primaryAccentColor, tokens, setPrimaryAccentColor, saveTheme, isSaving }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
