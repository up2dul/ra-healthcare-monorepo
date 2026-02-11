import { db } from "@ra-healthcare/db";
import { appointments, patients } from "@ra-healthcare/db/schema";
import { and, eq, gte, lte } from "drizzle-orm";
import { GraphQLError } from "graphql";

import {
  createAppointmentSchema,
  updateAppointmentSchema,
} from "@/graphql/validations";

export const appointmentResolvers = {
  Query: {
    appointments: async (
      _: unknown,
      args: { startDate?: string; endDate?: string; patientId?: string },
    ) => {
      const conditions = [];

      if (args.patientId) {
        conditions.push(eq(appointments.patientId, args.patientId));
      }
      if (args.startDate) {
        conditions.push(gte(appointments.startTime, new Date(args.startDate)));
      }
      if (args.endDate) {
        conditions.push(lte(appointments.endTime, new Date(args.endDate)));
      }

      return db
        .select()
        .from(appointments)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(appointments.startTime);
    },

    appointment: async (_: unknown, args: { id: string }) => {
      const result = await db
        .select()
        .from(appointments)
        .where(eq(appointments.id, args.id))
        .limit(1);

      return result[0] ?? null;
    },
  },

  Appointment: {
    patient: async (parent: { patientId: string }) => {
      const result = await db
        .select()
        .from(patients)
        .where(eq(patients.id, parent.patientId))
        .limit(1);

      return result[0];
    },
  },

  Mutation: {
    createAppointment: async (_: unknown, args: { input: unknown }) => {
      const parsed = createAppointmentSchema.safeParse(args.input);
      if (!parsed.success) {
        throw new GraphQLError(
          parsed.error.issues[0]?.message ?? "Validation failed",
          {
            extensions: { code: "BAD_USER_INPUT" },
          },
        );
      }

      const patientExists = await db
        .select({ id: patients.id })
        .from(patients)
        .where(eq(patients.id, parsed.data.patientId))
        .limit(1);

      if (!patientExists[0]) {
        throw new GraphQLError("Patient not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      const result = await db
        .insert(appointments)
        .values(parsed.data)
        .returning();

      return result[0];
    },

    updateAppointment: async (
      _: unknown,
      args: { id: string; input: unknown },
    ) => {
      const parsed = updateAppointmentSchema.safeParse(args.input);
      if (!parsed.success) {
        throw new GraphQLError(
          parsed.error.issues[0]?.message ?? "Validation failed",
          {
            extensions: { code: "BAD_USER_INPUT" },
          },
        );
      }

      const updateData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(parsed.data)) {
        if (value !== undefined && value !== null) {
          updateData[key] = value;
        }
      }

      const result = await db
        .update(appointments)
        .set(updateData)
        .where(eq(appointments.id, args.id))
        .returning();

      if (!result[0]) {
        throw new GraphQLError("Appointment not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return result[0];
    },

    deleteAppointment: async (_: unknown, args: { id: string }) => {
      const result = await db
        .delete(appointments)
        .where(eq(appointments.id, args.id))
        .returning({ id: appointments.id });

      if (!result[0]) {
        throw new GraphQLError("Appointment not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return true;
    },
  },
};
