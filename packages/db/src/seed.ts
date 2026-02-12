import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { reset, seed } from "drizzle-seed";
import * as schema from "./schema";

dotenv.config({ path: "../../apps/server/.env" });

const db = drizzle(process.env.DATABASE_URL!, { schema });

async function main() {
  const shouldReset = process.argv.includes("--reset");

  if (shouldReset) {
    console.log("🗑️  Resetting database...");
    await reset(db, schema);
    console.log("✅ Database reset complete.");
    return;
  }

  console.log("🌱 Seeding database...");

  await seed(db, schema, { count: 20 }).refine((f) => ({
    patients: {
      count: 20,
      columns: {
        name: f.fullName(),
        email: f.email(),
        phone: f.phoneNumber({ template: "+62 (###) ###-####" }),
        dateOfBirth: f.date({
          minDate: "1940-01-01",
          maxDate: "2005-12-31",
        }),
        address: f.streetAddress(),
      },
    },
    appointments: {
      count: 50,
      columns: {
        title: f.valuesFromArray({
          values: [
            "Annual Physical",
            "Follow-up Visit",
            "Lab Work Review",
            "Vaccination",
            "Consultation",
            "Dental Cleaning",
            "Eye Exam",
            "Blood Pressure Check",
            "X-Ray Review",
            "Mental Health Check-in",
            "Prescription Renewal",
            "Dermatology Screening",
            "Allergy Testing",
            "Cardiology Consultation",
            "Orthopedic Evaluation",
          ],
        }),
        description: f.loremIpsum({ sentencesCount: 2 }),
        startTime: f.date({
          minDate: "2026-02-01",
          maxDate: "2026-04-30",
        }),
        endTime: f.date({
          minDate: "2026-02-01",
          maxDate: "2026-04-30",
        }),
      },
    },
    workflowSteps: {
      count: 5,
      columns: {
        label: f.valuesFromArray({
          values: [
            "Check-in",
            "Triage",
            "Examination",
            "Treatment",
            "Discharge",
          ],
        }),
        order: f.int({ minValue: 1, maxValue: 5, isUnique: true }),
      },
    },
  }));

  console.log("✅ Seeding complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
