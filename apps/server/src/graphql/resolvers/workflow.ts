import { db } from "@ra-healthcare/db";
import { workflowSteps } from "@ra-healthcare/db/schema";
import { eq } from "drizzle-orm";
import { GraphQLError } from "graphql";

import { saveWorkflowSchema } from "@/graphql/validations";

export const workflowResolvers = {
  Query: {
    workflowSteps: async () => {
      return db.select().from(workflowSteps).orderBy(workflowSteps.order);
    },
  },

  Mutation: {
    saveWorkflow: async (_: unknown, args: { input: unknown }) => {
      const parsed = saveWorkflowSchema.safeParse(args.input);
      if (!parsed.success) {
        throw new GraphQLError(
          parsed.error.issues[0]?.message ?? "Validation failed",
          {
            extensions: { code: "BAD_USER_INPUT" },
          },
        );
      }

      return db.transaction(async (tx) => {
        const existing = await tx.select().from(workflowSteps);
        const incomingIds = new Set(
          parsed.data.steps.filter((s) => s.id).map((s) => s.id),
        );

        const toDelete = existing.filter((e) => !incomingIds.has(e.id));
        for (const step of toDelete) {
          await tx.delete(workflowSteps).where(eq(workflowSteps.id, step.id));
        }

        for (const step of parsed.data.steps) {
          if (step.id) {
            await tx
              .update(workflowSteps)
              .set({ label: step.label, order: step.order })
              .where(eq(workflowSteps.id, step.id));
          } else {
            await tx
              .insert(workflowSteps)
              .values({ label: step.label, order: step.order });
          }
        }

        return tx.select().from(workflowSteps).orderBy(workflowSteps.order);
      });
    },
  },
};
