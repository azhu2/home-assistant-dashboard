export interface RestAPI {
    healthCheck: () => Promise<boolean>
};

class RestAPIImpl implements RestAPI {
    baseURL: string;
    authToken: string;
    authHeaders: Headers;

    constructor(baseURL: string, authToken: string) {
        if (baseURL.endsWith('/')) {
            this.baseURL = `${baseURL}api/`;
        } else {
            this.baseURL = `${baseURL}/api/`;
        }
        this.authToken = authToken;
        this.authHeaders = new Headers({
            'Authorization': `Bearer ${this.authToken}`,
            'content-type': 'application/json',
        });
    }

    async healthCheck() {
        await fetch(new Request(this.baseURL, {
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
