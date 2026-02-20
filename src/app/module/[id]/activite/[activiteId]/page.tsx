import { modules } from "@/data/modules";
import ActiviteClient from "./ActiviteClient";

export function generateStaticParams() {
  return modules.flatMap((m) =>
    m.activites.map((a) => ({ id: m.id, activiteId: a.id }))
  );
}

export default function ActivitePage() {
  return <ActiviteClient />;
}
