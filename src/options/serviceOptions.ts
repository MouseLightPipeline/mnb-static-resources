export interface IServiceOptions {
    port: number;
    endpoint: string;
    isInternal: boolean;
    graphQLEndpoint: string;
}

const configuration: IServiceOptions = {
    port: 5000,
    endpoint: "/static",
    graphQLEndpoint: "/graphql",
    isInternal: false
};

function loadConfiguration() {
    const c = Object.assign({}, configuration);

    c.port = parseInt(process.env.STATIC_RESOURCES_PORT) || c.port;
    c.endpoint = process.env.STATIC_RESOURCES_ENDPOINT || c.endpoint;
    c.graphQLEndpoint = process.env.STATIC_API_ENDPOINT || process.env.CORE_SERVICES_ENDPOINT || c.graphQLEndpoint;
    c.isInternal = (process.env.STATIC_INTERNAL_ENDPOINT !== undefined && process.env.STATIC_INTERNAL_ENDPOINT === "true") || c.isInternal;

    return c;
}

export const ServiceOptions: IServiceOptions = loadConfiguration();
