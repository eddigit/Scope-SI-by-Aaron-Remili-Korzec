import { modules } from "@/data/modules";
import FicheClient from "./FicheClient";

export function generateStaticParams() {
  return modules.flatMap((m) =>
    m.fiches.map((f) => ({ id: m.id, ficheId: f.id }))
  );
}

export default function FichePage() {
  return <FicheClient />;
}
