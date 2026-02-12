import { z } from "zod";

const genderValues = ["male", "female"] as const;

export const patientFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be at most 255 characters"),
  email: z.email("Please enter a valid email"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .max(20, "Phone number is too long"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine(
      (val) => new Date(val) <= new Date(),
      "Date of birth cannot be in the future",
    ),
  gender: z.enum(genderValues, {
    error: "Gender is required",
  }),
  address: z
    .string()
    .min(5, "Please enter a complete address")
    .max(500, "Address is too long"),
});

export type PatientFormSchema = z.infer<typeof patientFormSchema>;
