/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'status-new': '#3b82f6',
                'status-processing': '#f59e0b',
                'status-completed': '#10b981',
                'status-denied': '#ef4444',
            }
        },
    },
    plugins: [],
}
