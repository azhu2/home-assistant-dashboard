export interface RestAPI {
    healthCheck: () => Promise<void>
};

class RestAPIImpl implements RestAPI {
    authToken: string

    constructor(authToken: string) {
        this.authToken = authToken;
    }

    async healthCheck() {
        await fetch(new Request('http://10.0.0.106:8123/api/', {
            headers: new Headers({
                'Authorization': `Bearer ${this.authToken}`,
                'content-type': 'application/json',
            })
        }));
        return;
    };
};

export const NewRestAPI = async (authToken: string) => {
    try {
        const api = new RestAPIImpl(authToken);
        await api.healthCheck();
        return api;
    } catch (err) {
        return new Error('Could not reach REST API.', { cause: err });
    }
}
