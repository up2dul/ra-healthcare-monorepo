import { useForm } from "@tanstack/react-form";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useMutation, useQuery } from "urql";
import { EditPatientSkeleton } from "@/components/patients/patient-skeleton";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { patientQuery, updatePatientMutation } from "@/graphql/patient";
import { cn, fieldError } from "@/lib/utils";
import { patientFormSchema } from "@/schemas/patient";
import type { Route } from "./+types/_index";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Edit Patient | RaHealthcare" }];
}

export default function EditPatientPage() {
  const { id } = useParams<"id">();
  const navigate = useNavigate();

  const [queryResult] = useQuery({
    query: patientQuery,
    variables: { id: id ?? "" },
    pause: !id,
  });

  const [updateResult, updatePatient] = useMutation(updatePatientMutation);

  const { data, fetching, error } = queryResult;
  const patient = data?.patient;

  const form = useForm({
    defaultValues: {
      name: patient?.name ?? "",
      email: patient?.email ?? "",
      phone: patient?.phone ?? "",
      dateOfBirth: patient?.dateOfBirth ?? "",
      gender: (patient?.gender ?? "") as "male" | "female" | "",
      address: patient?.address ?? "",
    },
    validators: {
      onChange: patientFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (!id) return;

      const res = await updatePatient({
        id,
        input: {
          name: value.name,
          email: value.email,
          phone: value.phone,
          dateOfBirth: value.dateOfBirth,
          gender: value.gender as "male" | "female",
          address: value.address,
        },
      });

      if (!res.error && res.data?.updatePatient) {
        navigate(`/patients/${id}`);
      }
    },
  });

  if (fetching) {
    return <EditPatientSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <ButtonLink to="/" variant="ghost" size="sm">
          <ArrowLeft data-icon="inline-start" />
          Back
        </ButtonLink>
        <p className="text-destructive text-sm">
          Failed to load patient. Please try again.
        </p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-4">
        <ButtonLink to="/" variant="ghost" size="sm">
          <ArrowLeft data-icon="inline-start" />
          Back
        </ButtonLink>
        <p className="text-muted-foreground text-sm">Patient not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="flex items-center justify-between">
        <ButtonLink to={`/patients/${id}`} variant="ghost" size="sm">
          <ArrowLeft data-icon="inline-start" />
          Back
        </ButtonLink>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Edit Patient</CardTitle>
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
                      disabled={updateResult.fetching}
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
                      disabled={updateResult.fetching}
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
                      disabled={updateResult.fetching}
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
                      disabled={updateResult.fetching}
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
                      disabled={updateResult.fetching}
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
                      disabled={updateResult.fetching}
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

            {updateResult.error && (
              <p className="text-destructive text-sm">
                {updateResult.error.message || "Failed to update patient"}
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
                    onClick={() => navigate(`/patients/${id}`)}
                    disabled={updateResult.fetching}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!canSubmit || updateResult.fetching}
                  >
                    {updateResult.fetching || isSubmitting
                      ? "Saving..."
                      : "Save Changes"}
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
