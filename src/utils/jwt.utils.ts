/**
 * Decode a JWT token to extract payload data
 */
export function decodeToken(token: string) {
    try {
        if (!token || typeof token !== 'string' || token.split('.').length < 2) {
            return null;
        }
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // Add padding if needed
        if (base64.length % 4 !== 0) {
            base64 = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
        }
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}
