"use client";

import { useState, useRef } from "react";

import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Package,
  Building2,
  Warehouse,
  Download,
  Eye,
  Loader2,
  Table,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  importProducts,
  importStockEntries,
  importHospitals,
  previewImport,
} from "./actions";

const importTypes = [
  {
    id: "products" as const,
    title: "Produits",
    description: "Importer des produits (code, nom, catégorie, prix...)",
    icon: Package,
    color: "bg-blue-500",
    templateColumns: ["code", "nom", "categorie", "unite", "conditionnement", "prix", "stock_min"],
  },
  {
    id: "stock" as const,
    title: "Entrées Stock",
    description: "Importer des entrées de stock (produit, lot, quantité, péremption)",
    icon: Warehouse,
    color: "bg-green-500",
    templateColumns: ["code_produit", "lot", "quantite", "date_peremption", "temperature", "document_reference"],
  },
  {
    id: "hospitals" as const,
    title: "Hôpitaux",
    description: "Importer des hôpitaux (code, nom, type, adresse...)",
    icon: Building2,
    color: "bg-purple-500",
    templateColumns: ["code", "nom", "type", "adresse", "telephone", "email", "lits"],
  },
];

const categoryExamples = `Exemples de catégories valides:
- MEDICAMENT (ou Médicaments, MED)
- VACCIN (ou Vaccins)
- REACTIF (ou Réactifs)
- CONSOMMABLE (ou Consommables)
- PETIT_MATERIEL
- MATERIEL_BUREAU`;

const hospitalTypeExamples = `Exemples de types valides:
- CENTRE_HOSPITALIER (ou Centre Hospitalier, CH)
- CENTRE_SANTE (ou Centre de Santé, CS)
- HOPITAL_PROVINCIAL (ou Hôpital Provincial, HP)`;

export default function ImportPage() {
  const [selectedType, setSelectedType] = useState<"products" | "stock" | "hospitals">("products");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[] | null>(null);
  const [previewErrors, setPreviewErrors] = useState<Array<{ row: number; message: string }> | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedImportType = importTypes.find((t) => t.id === selectedType)!;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".xlsx") && !selectedFile.name.endsWith(".xls")) {
        toast.error("Veuillez sélectionner un fichier Excel (.xlsx ou .xls)");
        return;
      }
      setFile(selectedFile);
      setPreview(null);
      setPreviewErrors(null);
      setResult(null);
      loadPreview(selectedFile);
    }
  }

  async function loadPreview(selectedFile: File) {
    setLoading(true);
    try {
      const buffer = await selectedFile.arrayBuffer();
      const result = await previewImport(selectedType, Buffer.from(buffer));
      
      if (result.success && 'preview' in result && result.preview) {
        setPreview(result.preview);
        toast.success(`${result.preview.length} lignes trouvées (aperçu des 10 premières)`);
      } else if ('errors' in result && result.errors && result.errors.length > 0) {
        setPreviewErrors(result.errors);
        toast.error(`${result.errors.length} erreurs trouvées`);
      }
    } catch (error) {
      toast.error("Erreur lors de la lecture du fichier");
    }
    setLoading(false);
  }

  async function handleImport() {
    if (!file) return;

    setImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      let result;

      switch (selectedType) {
        case "products":
          result = await importProducts(Buffer.from(buffer));
          break;
        case "stock":
          // TODO: Get actual userId from auth
          result = await importStockEntries(Buffer.from(buffer), "system");
          break;
        case "hospitals":
          result = await importHospitals(Buffer.from(buffer));
          break;
      }

      setResult(result);

      if (result.success && 'summary' in result && result.summary) {
        toast.success(
          `Import terminé: ${result.summary.created} créés, ${result.summary.updated} mis à jour`
        );
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        toast.error("L'import contient des erreurs");
      }
    } catch (error) {
      toast.error("Erreur lors de l'import");
    }
    setImporting(false);
  }

  function downloadTemplate() {
    const columns = selectedImportType.templateColumns.join("\t");
    const exampleRow = selectedImportType.templateColumns.map(() => "").join("\t");
    const csvContent = `${columns}\n${exampleRow}`;
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `template_${selectedType}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Import Excel</h1>
        <p className="text-muted-foreground">
          Importez des données en masse depuis des fichiers Excel
        </p>
      </div>

      {/* Import Type Selection */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {importTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          return (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all ${
                isSelected ? "border-primary ring-2 ring-primary" : "hover:border-muted-foreground"
              }`}
              onClick={() => {
                setSelectedType(type.id);
                setFile(null);
                setPreview(null);
                setPreviewErrors(null);
                setResult(null);
              }}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${type.color} flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle>{type.title}</CardTitle>
                <CardDescription>{type.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Format attendu</AlertTitle>
        <AlertDescription className="whitespace-pre-line">
          Fichier Excel (.xlsx) avec les colonnes suivantes:
          <code className="ml-2 bg-muted px-2 py-1 rounded text-sm">
            {selectedImportType.templateColumns.join(", ")}
          </code>
          {"\n\n"}
          {selectedType === "products" && categoryExamples}
          {selectedType === "hospitals" && hospitalTypeExamples}
          {selectedType === "stock" && "Dates acceptées: DD/MM/YYYY, YYYY-MM-DD ou format Excel"}
        </AlertDescription>
      </Alert>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Sélectionner un fichier</CardTitle>
          <CardDescription>
            Choisissez un fichier Excel à importer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="flex-1">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  file ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground"
                }`}
              >
                <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="font-medium">
                  {file ? file.name : "Cliquez pour sélectionner un fichier"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  .xlsx ou .xls, max 10MB
                </p>
              </div>
            </label>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger le template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {loading && (
        <Card>
          <CardContent className="py-8 text-center">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Analyse du fichier...</p>
          </CardContent>
        </Card>
      )}

      {previewErrors && previewErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreurs détectées ({previewErrors.length})</AlertTitle>
          <AlertDescription>
            <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
              {previewErrors.slice(0, 10).map((error, idx) => (
                <div key={idx} className="text-sm">
                  Ligne {error.row}: {error.message}
                </div>
              ))}
              {previewErrors.length > 10 && (
                <div className="text-sm">...et {previewErrors.length - 10} erreurs supplémentaires</div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {preview && preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Aperçu des données ({preview.length} lignes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    {Object.keys(preview[0]).map((key) => (
                      <th key={key} className="px-4 py-2 text-left font-medium">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx) => (
                    <tr key={idx} className="border-t">
                      {Object.values(row).map((value: any, vidx) => (
                        <td key={vidx} className="px-4 py-2">
                          {typeof value === "object"
                            ? value instanceof Date
                              ? value.toLocaleDateString("fr-FR")
                              : JSON.stringify(value)
                            : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Button */}
      {preview && preview.length > 0 && !result && (
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleImport}
            disabled={importing || !!(previewErrors && previewErrors.length > 0)}
          >
            {importing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Import en cours...
              </>
            ) : (
              <>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Importer {preview.length} lignes
              </>
            )}
          </Button>
        </div>
      )}

      {/* Result */}
      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          {result.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {result.success ? "Import terminé avec succès" : "Import terminé avec des erreurs"}
          </AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              <div className="flex gap-4">
                <Badge variant="outline">Total: {result.summary?.total}</Badge>
                <Badge variant="default" className="bg-green-600">
                  Créés: {result.summary?.created}
                </Badge>
                <Badge variant="default" className="bg-blue-600">
                  Mis à jour: {result.summary?.updated}
                </Badge>
                {result.summary?.errors > 0 && (
                  <Badge variant="destructive">Erreurs: {result.summary?.errors}</Badge>
                )}
              </div>
              {result.errors && result.errors.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto text-sm space-y-1">
                  {result.errors.slice(0, 5).map((error: any, idx: number) => (
                    <div key={idx}>
                      Ligne {error.row}: {error.message}
                    </div>
                  ))}
                  {result.errors.length > 5 && (
                    <div>...et {result.errors.length - 5} erreurs supplémentaires</div>
                  )}
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
