export interface RestAPI {
    getBaseURL: () => string;
    healthCheck: () => Promise<boolean>
};

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
            'content-type': 'application/json',
        });
    }

    getBaseURL() {
        return this.baseURL;
    }

    async healthCheck() {
        await fetch(new Request(`${this.baseURL}/api/`, {
            headers: this.authHeaders,
        }));
        return true;
    };
};

export const NewRestAPI = async (baseURL: string, authToken: string) => {
    try {
        const api = new RestAPIImpl(baseURL, authToken);
        await api.healthCheck();
        return api;
    } catch (err) {
        throw new Error('Could not reach REST API.', { cause: err });
    }
}
