// Simple color manipulation helpers without external libraries.

/**
 * Lightens or darkens a hex color by a given percentage.
 * @param hex The hex color string (e.g., "#RRGGBB").
 * @param percent A value from -100 to 100. Negative values darken, positive values lighten.
 * @returns The new hex color string.
 */
const shadeColor = (hex: string, percent: number): string => {
    let R = parseInt(hex.substring(1, 3), 16);
    let G = parseInt(hex.substring(3, 5), 16);
    let B = parseInt(hex.substring(5, 7), 16);

    R = Math.round(R * (100 + percent) / 100);
    G = Math.round(G * (100 + percent) / 100);
    B = Math.round(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;  
    G = (G < 255) ? G : 255;  
    B = (B < 255) ? B : 255;  

    const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
    const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
    const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
};

/**
 * Generates a CSS string to override Tailwind's default 'indigo' classes
 * with shades derived from a base color.
 * @param baseColor The new primary color in hex format (e.g., '#4f46e5').
 * @returns A string of CSS rules.
 */
export const generateThemeOverrides = (baseColor: string): string => {
    if (!baseColor || !baseColor.startsWith('#')) {
        return ''; // Return empty string if color is invalid
    }

    // Generate shades based on the base color (approximating Tailwind's scale)
    const color50 = shadeColor(baseColor, 80);
    const color100 = shadeColor(baseColor, 60);
    const color300 = shadeColor(baseColor, 30);
    const color400 = shadeColor(baseColor, 15);
    const color500 = shadeColor(baseColor, 0); // Base
    const color600 = shadeColor(baseColor, -10);
    const color700 = shadeColor(baseColor, -20);
    const color800 = shadeColor(baseColor, -30);
    const color900 = shadeColor(baseColor, -40);

    return `
        .from-indigo-500 { --tw-gradient-from: ${color500} var(--tw-gradient-from-position); --tw-gradient-to: rgb(79 70 229 / 0) var(--tw-gradient-to-position); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
        .bg-indigo-600 { background-color: ${color600} !important; }
        .hover\\:bg-indigo-700:hover { background-color: ${color700} !important; }
        .focus\\:ring-indigo-500:focus { --tw-ring-color: ${color500} !important; }
        .focus\\:border-indigo-500:focus { border-color: ${color500} !important; }
        .text-indigo-600 { color: ${color600} !important; }
        .text-indigo-500 { color: ${color500} !important; }
        .dark .text-indigo-400 { color: ${color400} !important; }
        .dark .hover\\:text-indigo-300:hover { color: ${color300} !important; }
        .hover\\:text-indigo-900:hover { color: ${color900} !important; }
        .border-indigo-500 { border-color: ${color500} !important; }
        .bg-indigo-100 { background-color: ${color100} !important; }
        .dark .bg-indigo-900\\/50 { background-color: ${color900} !important; opacity: 0.5; }
        .dark .bg-indigo-900\\/20 { background-color: ${color900} !important; opacity: 0.2; }
        .text-indigo-800 { color: ${color800} !important; }
        .dark .text-indigo-200 { color: ${color100} !important; }
        .dark .text-indigo-300 { color: ${color300} !important; }
        .bg-indigo-50 { background-color: ${color50} !important; }
        .dark .bg-indigo-900 { background-color: ${color900} !important; }
        .text-indigo-700 { color: ${color700} !important; }
        .bg-indigo-500 { background-color: ${color500} !important; }
    `;
};
