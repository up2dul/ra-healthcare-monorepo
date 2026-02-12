import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PatientCardProps {
  patient: {
    name: string;
    email: string;
    phone: string;
    gender: string;
  };
}

export default function PatientCard({ patient }: PatientCardProps) {
  return (
    <Card size="sm" className="transition-colors hover:bg-muted/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <img
            src={`https://api.dicebear.com/9.x/initials/svg?seed=${patient.name}`}
            alt={patient.name}
            className="size-8 rounded-full"
          />
          <div className="min-w-0 flex-1">
            <CardTitle>{patient.name}</CardTitle>
            <CardDescription>
              {[patient.email, patient.phone].filter(Boolean).join(" · ") ||
                "No contact info"}
            </CardDescription>
          </div>
          {patient.gender && (
            <span className="text-muted-foreground text-xs capitalize">
              {patient.gender}
            </span>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
