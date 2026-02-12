import { useForm } from "@tanstack/react-form";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { useMutation } from "urql";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPatientMutation } from "@/graphql/patient";
import { cn, fieldError } from "@/lib/utils";
import { patientFormSchema } from "@/schemas/patient";

export default function NewPatientPage() {
  const navigate = useNavigate();
  const [result, createPatient] = useMutation(createPatientMutation);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "" as "male" | "female" | "",
      address: "",
    },
    validators: {
      onChange: patientFormSchema,
    },
    onSubmit: async ({ value }) => {
      const res = await createPatient({
        input: {
          name: value.name,
          email: value.email,
          phone: value.phone,
          dateOfBirth: value.dateOfBirth,
          gender: value.gender as "male" | "female",
          address: value.address,
        },
      });

      if (!res.error && res.data?.createPatient) {
        navigate(`/patients/${res.data.createPatient.id}`);
      }
    },
  });

  return (
    <div className="space-y-4">
      <section className="flex items-center justify-between">
        <ButtonLink to="/" variant="ghost" size="sm">
          <ArrowLeft data-icon="inline-start" />
          Back
        </ButtonLink>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Add New Patient</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <fieldset className="grid gap-4 sm:grid-cols-2">
              <form.Field name="name">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                      disabled={result.fetching}
                    />
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <p className="text-destructive text-xs">
                          {fieldError(field.state.meta.errors[0])}
                        </p>
                      )}
                  </div>
                )}
              </form.Field>

              <form.Field name="email">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                      disabled={result.fetching}
                    />
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <p className="text-destructive text-xs">
                          {fieldError(field.state.meta.errors[0])}
                        </p>
                      )}
                  </div>
                )}
              </form.Field>

              <form.Field name="phone">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>
                      Phone <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="tel"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                      disabled={result.fetching}
                    />
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <p className="text-destructive text-xs">
                          {fieldError(field.state.meta.errors[0])}
                        </p>
                      )}
                  </div>
                )}
              </form.Field>

              <form.Field name="dateOfBirth">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>
                      Date of Birth <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="date"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                      disabled={result.fetching}
                    />
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <p className="text-destructive text-xs">
                          {fieldError(field.state.meta.errors[0])}
                        </p>
                      )}
                  </div>
                )}
              </form.Field>

              <form.Field name="gender">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>
                      Gender <span className="text-destructive">*</span>
                    </Label>
                    <select
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value as "" | "male" | "female",
                        )
                      }
                      onBlur={field.handleBlur}
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                      disabled={result.fetching}
                      className={cn(
                        "h-8 w-full rounded-none border border-input bg-transparent px-2.5 py-1 text-xs outline-none transition-colors",
                        "focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
                        "disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50",
                        "dark:bg-input/30",
                        field.state.meta.isTouched &&
                          !field.state.meta.isValid &&
                          "border-destructive ring-1 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40",
                      )}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <p className="text-destructive text-xs">
                          {fieldError(field.state.meta.errors[0])}
                        </p>
                      )}
                  </div>
                )}
              </form.Field>

              <form.Field name="address">
                {(field) => (
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor={field.name}>
                      Address <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                      disabled={result.fetching}
                    />
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <p className="text-destructive text-xs">
                          {fieldError(field.state.meta.errors[0])}
                        </p>
                      )}
                  </div>
                )}
              </form.Field>
            </fieldset>

            {result.error && (
              <p className="text-destructive text-sm">
                {result.error.message || "Failed to create patient"}
              </p>
            )}

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/")}
                    disabled={result.fetching}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!canSubmit || result.fetching}
                  >
                    {result.fetching || isSubmitting
                      ? "Creating..."
                      : "Create Patient"}
                  </Button>
                </div>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
