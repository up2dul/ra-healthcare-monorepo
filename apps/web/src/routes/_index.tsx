import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useQuery } from "urql";
import PatientCard from "@/components/patients/patient-card";
import PatientSearch from "@/components/patients/patient-search";
import { PatientListSkeleton } from "@/components/patients/patient-skeleton";
import { Button, ButtonLink } from "@/components/ui/button";
import { patientsQuery } from "@/graphql/patient";
import { useDebounce } from "@/hooks/use-debounce";
import type { PatientFormSchema } from "@/schemas/patient";
import type { Route } from "./+types/_index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Patients | RaHealthcare" },
    {
      name: "description",
      content: "RaHealthcare is a simple healthcare scheduling app",
    },
  ];
}

const PAGE_LIMIT = 10;

interface Patient extends PatientFormSchema {
  id: string;
}

export default function PatientsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page") ?? "1");

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const debouncedSearch = useDebounce(search);

  const [result] = useQuery({
    query: patientsQuery,
    variables: {
      page: currentPage,
      limit: PAGE_LIMIT,
      search: debouncedSearch || undefined,
    },
  });

  const { data, fetching, error } = result;
  const patients = data?.patients;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setSearchParams((prev) => {
      if (value) {
        prev.set("search", value);
      } else {
        prev.delete("search");
      }
      prev.set("page", "1");
      return prev;
    });
  };

  const goToPage = (page: number) => {
    setSearchParams((prev) => {
      prev.set("page", String(page));
      return prev;
    });
  };

  return (
    <div className="space-y-4">
      <section className="flex items-center justify-between">
        <h1 className="font-semibold text-lg">Patients</h1>
        <ButtonLink to="/patients/new">
          <Plus data-icon="inline-start" />
          Add Patient
        </ButtonLink>
      </section>

      <section className="relative">
        <PatientSearch searchValue={search} onSearch={handleSearchChange} />
      </section>

      <section>
        {error && (
          <p className="text-destructive text-sm">
            Failed to load patients. Please try again.
          </p>
        )}

        {fetching && <PatientListSkeleton />}

        {!fetching && patients && (
          <>
            {patients.data.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                {debouncedSearch
                  ? `No patients found for "${debouncedSearch}"`
                  : "No patients yet. Add your first patient!"}
              </div>
            ) : (
              <ul className="grid gap-2">
                {patients.data.map((patient: Patient) => (
                  <li key={patient.id}>
                    <Link to={`/patients/${patient.id}`}>
                      <PatientCard patient={patient} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {patients.totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-muted-foreground text-xs">
                  Showing {(patients.page - 1) * patients.limit + 1}–
                  {Math.min(patients.page * patients.limit, patients.total)} of{" "}
                  {patients.total}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon-xs"
                    disabled={currentPage <= 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-xs"
                    disabled={currentPage >= patients.totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
