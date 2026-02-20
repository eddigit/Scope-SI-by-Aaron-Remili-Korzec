import { modules } from "@/data/modules";
import ModuleClient from "./ModuleClient";

export function generateStaticParams() {
  return modules.map((m) => ({ id: m.id }));
}

export default function ModulePage() {
  return <ModuleClient />;
}
