export interface IServiceOptions {
    port: number;
    endpoint: string;
}

const configuration: IServiceOptions = {
    port: 5000,
    endpoint: "/static"
};

function loadConfiguration() {
    const c = Object.assign({}, configuration);

    c.port = parseInt(process.env.STATIC_RESOURCES_PORT) || c.port;
    c.endpoint = process.env.STATIC_RESOURCES_ENDPOINT || c.endpoint;

    return c;
}

export const ServiceOptions: IServiceOptions = loadConfiguration();
