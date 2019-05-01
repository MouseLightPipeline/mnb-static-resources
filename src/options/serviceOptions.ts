export interface IServiceOptions {
    port: number;
    endpoint: string;
    graphQLEndpoint: string;
    isInternal: boolean;
    sliceMountPoint: string;
}

const configuration: IServiceOptions = {
    port: 5000,
    endpoint: "/static",
    graphQLEndpoint: "/graphql",
    isInternal: false,
    sliceMountPoint: "/app/static/slice/"
};

function loadConfiguration() {
    const c = Object.assign({}, configuration);

    c.port = parseInt(process.env.STATIC_RESOURCES_PORT) || c.port;
    c.endpoint = process.env.STATIC_RESOURCES_ENDPOINT || c.endpoint;
    c.graphQLEndpoint = process.env.STATIC_API_ENDPOINT || process.env.CORE_SERVICES_ENDPOINT || c.graphQLEndpoint;
    c.sliceMountPoint = process.env.STATIC_SLICE_MOUNT_POINT || process.env.CORE_SERVICES_ENDPOINT || c.sliceMountPoint;
    c.isInternal = process.env.STATIC_API_IS_INTERNAL === undefined ? true : parseInt(process.env.STATIC_API_IS_INTERNAL) > 0;


    return c;
}

export const ServiceOptions: IServiceOptions = loadConfiguration();
