import { createSchema, createYoga } from "graphql-yoga";

import { resolvers } from "./resolvers";
import { typeDefs } from "./type-defs";

export const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  graphqlEndpoint: "/graphql",
});
