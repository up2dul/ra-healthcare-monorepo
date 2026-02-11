import { GraphQLScalarType, Kind } from "graphql";

import { appointmentResolvers } from "./appointment";
import { patientResolvers } from "./patient";
import { workflowResolvers } from "./workflow";

const DateTimeScalar = new GraphQLScalarType({
  name: "DateTime",
  description: "ISO-8601 DateTime string",
  serialize(value) {
    return value instanceof Date ? value.toISOString() : value;
  },
  parseValue(value) {
    return new Date(value as string);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

export const resolvers = {
  DateTime: DateTimeScalar,
  Query: {
    ...patientResolvers.Query,
    ...appointmentResolvers.Query,
    ...workflowResolvers.Query,
  },
  Mutation: {
    ...patientResolvers.Mutation,
    ...appointmentResolvers.Mutation,
    ...workflowResolvers.Mutation,
  },
  Patient: patientResolvers.Patient,
  Appointment: appointmentResolvers.Appointment,
};
