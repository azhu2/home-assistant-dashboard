export interface RestAPI {
    getBaseURL: () => string;
    healthCheck: () => Promise<boolean>;
};

// TODO Deprecate? This isn't actually used anywhere - just the /api/ base URL for camera snapshots/video, but those are working without auth
class RestAPIImpl implements RestAPI {
    baseURL: string;
    authToken: string;
    authHeaders: Headers;

    constructor(baseURL: string, authToken: string) {
        if (baseURL.endsWith('/')) {
            this.baseURL = baseURL.slice(0, baseURL.length - 1);
        } else {
            this.baseURL = baseURL;
        }
        this.authToken = authToken;
        this.authHeaders = new Headers({
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json',
        });
    }

    getBaseURL() {
        return this.baseURL;
    }

    async healthCheck() {
        // This was falsely always returning true before. No use now except to spam logs on failure.
        // await fetch(new Request(`${this.baseURL}/api/`, { headers: this.authHeaders }));
        return true;
    };
};

export const create = async (baseURL: string, authToken: string) => {
    try {
        const api = new RestAPIImpl(baseURL, authToken);
        await api.healthCheck();
        return api;
    } catch (err) {
        throw new Error('Could not reach REST API.', { cause: err });
    }
}
