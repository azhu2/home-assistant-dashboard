import {
    useEffect,
    useState
} from 'react';
import {
    Auth,
    createConnection,
    Connection,
    getAuth,
    getAuthOptions,
    subscribeEntities,
} from 'home-assistant-js-websocket';

function Dashboard() {
    const [connection, setConnection] = useState<Connection | undefined>();

    useEffect(() => {
        const connectToHA = async (): Promise<Connection> => {
            const auth = await authenticate();
            const c = await createConnection({ auth });
            setConnection(c);
            return c;
        }

        const setupSubscription = (connection: Connection) => {
            subscribeEntities(connection, (entities) => {
                console.log("Entities found:", entities)
            });
        }

        const authenticate = async (hassUrl?: string | null): Promise<Auth> => {
            const options: getAuthOptions = {
                hassUrl: hassUrl == null ? undefined : hassUrl,
                saveTokens: (tokens) => {
                    localStorage.haTokens = JSON.stringify(tokens);
                },
                loadTokens: () => {
                    try {
                        return JSON.parse(localStorage.haTokens)
                    } catch {
                        return undefined;
                    }
                },
            };
            try {
                // Try to pick up authentication after user logs in
                return await getAuth(options);
            } catch (err) {
                const hassUrl = prompt(
                    `[Error ${err}] What host to connect to?`,
                    "http://localhost:8123"
                );
                // Spin until auth succeeds
                return await authenticate(hassUrl);
            }
        }

        connectToHA()
            .then(setupSubscription)
            .catch(err => alert(`Unable to connect to Home Assistant: ${err}`));

        return () => {
            connection?.close();
        }
    }, []);

    return (
        <p>Hello world!</p>
    )
}

export default Dashboard;