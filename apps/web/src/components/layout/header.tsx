import { NavLink } from "react-router";
import { cn } from "@/lib/utils";
import { ModeToggle } from "../mode-toggle";

export default function Header() {
  const links = [
    { to: "/", label: "Patients" },
    { to: "/appointments", label: "Appointments" },
    { to: "/workflow", label: "Workflow" },
  ] as const;

  return (
    <header
      className={cn(
        "flex flex-row items-center justify-between",
        "border-border border-b",
        "px-2 py-4 md:px-12 lg:px-44 xl:px-72 2xl:px-96",
      )}
    >
      <NavLink to="/">🏥 RaHealthcare</NavLink>
      <nav className="flex gap-4 text-sm">
        {links.map(({ to, label }) => {
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? "font-semibold" : "")}
              end
            >
              {label}
            </NavLink>
          );
        })}
      </nav>
      <ModeToggle />
    </header>
  );
}
