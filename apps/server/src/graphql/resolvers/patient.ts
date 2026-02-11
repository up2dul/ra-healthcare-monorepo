import { db } from "@ra-healthcare/db";
import { patients } from "@ra-healthcare/db/schema";
import { count, eq, ilike, or } from "drizzle-orm";
import { GraphQLError } from "graphql";

import {
  createPatientSchema,
  updatePatientSchema,
} from "@/graphql/validations";

export const patientResolvers = {
  Query: {
    patients: async (
      _: unknown,
      args: { page?: number; limit?: number; search?: string },
    ) => {
      const page = Math.max(1, args.page ?? 1);
      const limit = Math.min(100, Math.max(1, args.limit ?? 10));
      const offset = (page - 1) * limit;

      const searchCondition = args.search
        ? or(
            ilike(patients.name, `%${args.search}%`),
            ilike(patients.email, `%${args.search}%`),
            ilike(patients.phone, `%${args.search}%`),
          )
        : undefined;

      const [data, totalResult] = await Promise.all([
        db
          .select()
          .from(patients)
          .where(searchCondition)
          .orderBy(patients.createdAt)
          .limit(limit)
          .offset(offset),
        db.select({ count: count() }).from(patients).where(searchCondition),
      ]);

      const total = totalResult[0]?.count ?? 0;

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    },

    patient: async (_: unknown, args: { id: string }) => {
      const result = await db
        .select()
        .from(patients)
        .where(eq(patients.id, args.id))
        .limit(1);

      return result[0] ?? null;
    },
  },

  Patient: {
    appointments: async (parent: { id: string }) => {
      const { appointments: appointmentsTable } = await import(
        "@ra-healthcare/db/schema"
      );
      return db
        .select()
        .from(appointmentsTable)
        .where(eq(appointmentsTable.patientId, parent.id))
        .orderBy(appointmentsTable.startTime);
    },
  },

  Mutation: {
    createPatient: async (_: unknown, args: { input: unknown }) => {
      const parsed = createPatientSchema.safeParse(args.input);
      if (!parsed.success) {
        throw new GraphQLError(
          parsed.error.issues[0]?.message ?? "Validation failed",
          {
            extensions: { code: "BAD_USER_INPUT" },
          },
        );
      }

      const result = await db.insert(patients).values(parsed.data).returning();

      return result[0];
    },

    updatePatient: async (_: unknown, args: { id: string; input: unknown }) => {
      const parsed = updatePatientSchema.safeParse(args.input);
      if (!parsed.success) {
        throw new GraphQLError(
          parsed.error.issues[0]?.message ?? "Validation failed",
          {
            extensions: { code: "BAD_USER_INPUT" },
          },
        );
      }

      const result = await db
        .update(patients)
        .set(parsed.data)
        .where(eq(patients.id, args.id))
        .returning();

      if (!result[0]) {
        throw new GraphQLError("Patient not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return result[0];
    },

    deletePatient: async (_: unknown, args: { id: string }) => {
      const result = await db
        .delete(patients)
        .where(eq(patients.id, args.id))
        .returning({ id: patients.id });

      if (!result[0]) {
        throw new GraphQLError("Patient not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return true;
    },
  },
};
