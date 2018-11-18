export interface IServiceOptions {
    port: number;
}

const configuration: IServiceOptions = {
    port: 5000,
};

function loadConfiguration() {
    const c = Object.assign({}, configuration);

    c.port = parseInt(process.env.STATIC_RESOURCES_PORT) || c.port;

    return c;
}

export const ServiceOptions: IServiceOptions = loadConfiguration();
