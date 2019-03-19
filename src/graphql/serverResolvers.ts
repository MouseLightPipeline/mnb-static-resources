import { GraphQLScalarType } from "graphql";
import {GraphQLServerContext} from "./serverContext";
import { Kind } from "graphql/language";

import {TomographyManager} from "../slice/tomographyManager";
import {SampleTomography} from "../slice/sampleTomography";

const resolvers = {
    Query: {
        tomographyMetadata(_, args: any, context: GraphQLServerContext): SampleTomography[] {
            return TomographyManager.asList();
        },
    },
    Date: new GraphQLScalarType({
        name: "Date",
        description: "Date custom scalar type",
        parseValue: (value) => {
            return new Date(value); // value from the client
        },
        serialize: (value) => {
            return value.getTime(); // value sent to the client
        },
        parseLiteral: (ast) => {
            if (ast.kind === Kind.INT) {
                return parseInt(ast.value, 10); // ast value is always in string format
            }
            return null;
        },
    })
};

export default resolvers;
