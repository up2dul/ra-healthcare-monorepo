import {
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useMutation, useQuery } from "urql";
import { PatientDetailSkeleton } from "@/components/patients/patient-skeleton";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deletePatientMutation, patientQuery } from "@/graphql/patient";
import { cn, formatDate, formatTime } from "@/lib/utils";
import type { Route } from "./+types/_index";

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function meta({}: Route.MetaArgs) {
  return [{ title: "Patient Detail | RaHealthcare" }];
}

export default function PatientDetailPage() {
  const { id } = useParams<"id">();
  const navigate = useNavigate();

  const [result] = useQuery({
    query: patientQuery,
    variables: { id: id ?? "" },
    pause: !id,
  });

  const [deleteResult, deletePatient] = useMutation(deletePatientMutation);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data, fetching, error } = result;
  const patient = data?.patient;

  const handleDelete = async () => {
    if (!id) return;

    const res = await deletePatient({ id });
    if (!res.error) {
      setDeleteDialogOpen(false);
      navigate("/");
    }
  };

  if (fetching) {
    return <PatientDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <BackButton />
        <p className="text-destructive text-sm">
          Failed to load patient. Please try again.
        </p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-4">
        <BackButton />
        <p className="text-muted-foreground text-sm">Patient not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="flex items-center justify-between">
        <BackButton />
        <div className="flex gap-1">
          <ButtonLink to={`/patients/edit/${id}`} variant="outline">
            <Pencil data-icon="inline-start" />
            Edit
          </ButtonLink>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="destructive"
                  disabled={deleteResult.fetching}
                />
              }
            >
              <Trash2 data-icon="inline-start" />
              Delete
            </DialogTrigger>
            <DialogContent showCloseButton={false}>
              <DialogHeader>
                <DialogTitle>Delete Patient</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete{" "}
                  <strong>{patient.name}</strong>? This action cannot be undone
                  and will also remove all associated appointments.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleteResult.fetching}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteResult.fetching}
                >
                  {deleteResult.fetching ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <img
              src={`https://api.dicebear.com/9.x/initials/svg?seed=${patient.name}`}
              alt={patient.name}
              className="size-10 rounded-full"
            />
            <div>
              <CardTitle className="text-base">{patient.name}</CardTitle>
              <CardDescription className="capitalize">
                {patient.gender ?? "Unknown gender"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2">
            <InfoItem icon={Mail} label="Email" value={patient.email} />
            <InfoItem icon={Phone} label="Phone" value={patient.phone} />
            <InfoItem
              icon={Calendar}
              label="Date of Birth"
              value={formatDate(patient.dateOfBirth)}
            />
            <InfoItem icon={MapPin} label="Address" value={patient.address} />
          </dl>
        </CardContent>
      </Card>

      <section className="space-y-2">
        <h2 className="font-semibold text-sm">Appointments</h2>

        {patient.appointments.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground text-xs">
            No appointments yet.
          </p>
        ) : (
          <ul className="grid gap-2">
            {patient.appointments.map(
              (appt: {
                id: string;
                title: string;
                startTime: string;
                endTime: string;
                status: string;
              }) => (
                <li key={appt.id}>
                  <Link to={`/appointments/${appt.id}`}>
                    <Card size="sm">
                      <CardHeader>
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <CardTitle>{appt.title}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {formatDate(appt.startTime)}{" "}
                              {formatTime(appt.startTime)} -{" "}
                              {formatTime(appt.endTime)}
                            </CardDescription>
                          </div>
                          <span
                            className={cn(
                              "shrink-0 rounded-sm px-1.5 py-0.5 font-medium text-[10px] capitalize",
                              STATUS_STYLES[appt.status] ??
                                "bg-muted text-muted-foreground",
                            )}
                          >
                            {appt.status}
                          </span>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                </li>
              ),
            )}
          </ul>
        )}
      </section>
    </div>
  );
}

function BackButton() {
  return (
    <ButtonLink to="/" variant="ghost" size="sm">
      <ArrowLeft data-icon="inline-start" />
      Back
    </ButtonLink>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-3.5 text-muted-foreground" />
      <div>
        <dt className="text-[11px] text-muted-foreground">{label}</dt>
        <dd className="text-sm">{value || "—"}</dd>
      </div>
    </div>
  );
}
