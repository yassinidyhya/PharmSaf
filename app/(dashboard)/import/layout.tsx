import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Import Excel | Pharmacie Provinciale",
  description: "Importer des données depuis Excel",
};

export default function ImportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
