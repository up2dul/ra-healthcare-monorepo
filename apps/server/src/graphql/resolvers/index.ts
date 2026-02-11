import { GraphQLScalarType, Kind } from "graphql";
import { GraphQLError } from "graphql/error";
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
    if (typeof value !== "string") {
      throw new GraphQLError("DateTime value must be a string.");
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new GraphQLError(
        "DateTime value must be a valid ISO-8601 date string.",
      );
    }
    return date;
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      return null;
    }
    const date = new Date(ast.value);
    if (Number.isNaN(date.getTime())) {
      throw new GraphQLError(
        "DateTime value must be a valid ISO-8601 date string.",
      );
    }
    return date;
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
