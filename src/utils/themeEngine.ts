/**
 * Dynamic Institutional Theming Engine
 * Algorithmic generation of cohesive, WCAG-compliant color palettes
 * derived from a single institutional primary accent color.
 */

export interface ThemeTokens {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    primaryContainer: string;
    onPrimary: string;
    onPrimaryContainer: string;
    primaryFixed: string;
    primaryFixedDim: string;
    onPrimaryFixed: string;
    onPrimaryFixedVariant: string;

    secondary: string;
    secondaryHover: string;
    secondaryContainer: string;
    onSecondary: string;
    onSecondaryContainer: string;

    surfaceTint: string;
    focusRing: string;
}

// Convert HEX to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
    let cleanHex = hex.replace('#', '').trim();
    if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const num = parseInt(cleanHex, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

// Convert RGB to HEX
export function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

// Convert HSL to HEX
export function hslToHex(h: number, s: number, l: number): string {
    h = (h % 360 + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }

    return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

// Calculate WCAG relative luminance
export function calculateLuminance(hex: string): number {
    const { r, g, b } = hexToRgb(hex);
    const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Calculate WCAG compliant text color (#ffffff or #0f172a)
export function getAccessibleTextColor(backgroundHex: string): string {
    const luminance = calculateLuminance(backgroundHex);
    // Contrast with white: (1.05) / (lum + 0.05)
    // Contrast with black: (lum + 0.05) / (0.05)
    const whiteRatio = 1.05 / (luminance + 0.05);
    const darkRatio = (luminance + 0.05) / 0.05;

    return whiteRatio >= 4.5 || whiteRatio >= darkRatio ? '#ffffff' : '#0f172a';
}

/**
 * Generate full design token suite from a single Primary Accent Hex
 */
export function generateThemeTokens(primaryHex: string): ThemeTokens {
    const rgb = hexToRgb(primaryHex);
    const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Primary Variations
    const primary = primaryHex;
    const primaryHover = hslToHex(h, s, Math.max(0, l - 8));
    const primaryActive = hslToHex(h, s, Math.max(0, l - 15));
    // Deep, premium brand container for sidebars and brand surfaces
    const primaryContainer = hslToHex(h, Math.min(80, Math.max(40, s)), Math.max(14, Math.min(24, l * 0.45)));
    const onPrimary = getAccessibleTextColor(primary);
    // High-contrast soft illuminated text for the deep brand container
    const onPrimaryContainer = hslToHex(h, Math.min(60, s), 88);

    const primaryFixed = hslToHex(h, Math.min(60, s), 90);
    const primaryFixedDim = hslToHex(h, Math.min(50, s), 80);
    const onPrimaryFixed = hslToHex(h, Math.min(90, s), 15);
    const onPrimaryFixedVariant = hslToHex(h, Math.min(80, s), 30);

    // Secondary Derivation: Harmonious slate tone with subtle primary hue cast
    const secondaryH = (h + 15) % 360;
    const secondary = hslToHex(secondaryH, Math.min(25, s * 0.35), 40);
    const secondaryHover = hslToHex(secondaryH, Math.min(25, s * 0.35), 32);
    const secondaryContainer = hslToHex(secondaryH, Math.min(30, s * 0.4), 92);
    const onSecondary = '#ffffff';
    const onSecondaryContainer = hslToHex(secondaryH, Math.min(35, s * 0.45), 20);

    const surfaceTint = primary;
    const focusRing = hslToHex(h, s, Math.min(80, l + 10));

    return {
        primary,
        primaryHover,
        primaryActive,
        primaryContainer,
        onPrimary,
        onPrimaryContainer,
        primaryFixed,
        primaryFixedDim,
        onPrimaryFixed,
        onPrimaryFixedVariant,
        secondary,
        secondaryHover,
        secondaryContainer,
        onSecondary,
        onSecondaryContainer,
        surfaceTint,
        focusRing
    };
}

/**
 * Check if the current route belongs to an Admin or Service Provider workspace
 */
export function isTenantThemeRoute(pathname: string): boolean {
    const path = pathname.toLowerCase();
    return (
        path.startsWith('/admin') ||
        path.startsWith('/provider') ||
        path === '/master-calendar' ||
        path === '/patients' ||
        path === '/services' ||
        path === '/analytics'
    );
}

/**
 * Toggle the tenant theme scope attribute and class on <html>
 */
export function activateTenantThemeScope(enable: boolean) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const propsToClear = [
        '--color-primary', '--color-primary-hover', '--color-primary-active',
        '--color-primary-container', '--color-on-primary', '--color-on-primary-container',
        '--color-primary-fixed', '--color-primary-fixed-dim', '--color-on-primary-fixed',
        '--color-on-primary-fixed-variant', '--color-secondary', '--color-secondary-hover',
        '--color-secondary-container', '--color-on-secondary', '--color-on-secondary-container',
        '--color-surface-tint', '--color-focus-ring'
    ];

    // Always clear inline properties on :root/body to avoid leaking into public pages
    propsToClear.forEach(p => {
        root.style.removeProperty(p);
        document.body?.style.removeProperty(p);
    });

    if (enable) {
        root.setAttribute('data-theme-scope', 'tenant');
        root.classList.add('tenant-theme');
        document.body?.classList.add('tenant-theme');
    } else {
        root.removeAttribute('data-theme-scope');
        root.classList.remove('tenant-theme');
        document.body?.classList.remove('tenant-theme');
    }
}

/**
 * Apply generated tokens strictly to scoped tenant elements
 */
export function applyTheme(primaryHex: string): ThemeTokens {
    if (!primaryHex || !primaryHex.startsWith('#')) {
        primaryHex = '#003fb1'; // Default Brand Royal Blue
    }

    const tokens = generateThemeTokens(primaryHex);

    if (typeof document !== 'undefined') {
        const root = document.documentElement;
        // Ensure no inline properties leak on :root
        const propsToClear = [
            '--color-primary', '--color-primary-hover', '--color-primary-active',
            '--color-primary-container', '--color-on-primary', '--color-on-primary-container',
            '--color-primary-fixed', '--color-primary-fixed-dim', '--color-on-primary-fixed',
            '--color-on-primary-fixed-variant', '--color-secondary', '--color-secondary-hover',
            '--color-secondary-container', '--color-on-secondary', '--color-on-secondary-container',
            '--color-surface-tint', '--color-focus-ring'
        ];
        propsToClear.forEach(p => {
            root.style.removeProperty(p);
            document.body?.style.removeProperty(p);
        });

        // Dynamic stylesheet injection strictly scoped to tenant theme
        let styleTag = document.getElementById('omni-dynamic-theme') as HTMLStyleElement | null;
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'omni-dynamic-theme';
            document.head.appendChild(styleTag);
        }

        styleTag.textContent = `
            html[data-theme-scope="tenant"],
            body[data-theme-scope="tenant"],
            .tenant-theme {
                --color-primary: ${tokens.primary} !important;
                --color-primary-hover: ${tokens.primaryHover} !important;
                --color-primary-active: ${tokens.primaryActive} !important;
                --color-primary-container: ${tokens.primaryContainer} !important;
                --color-on-primary: ${tokens.onPrimary} !important;
                --color-on-primary-container: ${tokens.onPrimaryContainer} !important;
                --color-primary-fixed: ${tokens.primaryFixed} !important;
                --color-primary-fixed-dim: ${tokens.primaryFixedDim} !important;
                --color-on-primary-fixed: ${tokens.onPrimaryFixed} !important;
                --color-on-primary-fixed-variant: ${tokens.onPrimaryFixedVariant} !important;

                --color-secondary: ${tokens.secondary} !important;
                --color-secondary-hover: ${tokens.secondaryHover} !important;
                --color-secondary-container: ${tokens.secondaryContainer} !important;
                --color-on-secondary: ${tokens.onSecondary} !important;
                --color-on-secondary-container: ${tokens.onSecondaryContainer} !important;

                --color-surface-tint: ${tokens.surfaceTint} !important;
                --color-focus-ring: ${tokens.focusRing} !important;
            }
        `;
    }

    // Save to localStorage for instant hydration in admin/provider pages
    localStorage.setItem('primaryAccentColor', primaryHex);

    return tokens;
}
