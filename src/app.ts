import * as path from "path";
import * as os from "os";
import * as express from "express";
import bodyParser = require("body-parser");
import {ApolloServer} from "apollo-server-express";

const debug = require("debug")("mnb:static-resources:server");

import {ServiceOptions} from "./options/serviceOptions";
import typeDefinitions from "./graphql/typeDefinitions";
import resolvers from "./graphql/serverResolvers";
import {GraphQLServerContext} from "./graphql/serverContext";
import {sliceImageMiddleware, sliceMiddleware} from "./middleware/sliceMiddleware";
import {TomographyManager} from "./slice/tomographyManager";

TomographyManager.LoadSampleTomography();

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());

if (process.env.NODE_ENV !== "production") {
    app.use(ServiceOptions.endpoint, express.static(path.resolve(path.normalize("assets"))));
} else {
    app.use(ServiceOptions.endpoint, express.static("static"));
}

app.use("/slice", sliceMiddleware);
app.use("/sliceImage", sliceImageMiddleware);

const server = new ApolloServer({
    typeDefs: typeDefinitions,
    resolvers,
    introspection: true, // ServiceOptions.isInternal,
    playground: true, // ServiceOptions.isInternal,
    context: () => new GraphQLServerContext()
});

server.applyMiddleware({app, path: ServiceOptions.graphQLEndpoint});

app.listen(ServiceOptions.port, () => debug(`listening on http://${os.hostname()}:${ServiceOptions.port}`));
