"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Package,
  CheckCircle,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getAvailableProducts, createKit } from "../actions";

const kitTypeOptions = [
  { value: "NORMAL", label: "Accouchement normal", description: "Kit standard pour accouchement" },
  { value: "EPISIOTOMIE", label: "Épisiotomie", description: "Kit avec matériel pour épisiotomie" },
];

interface KitComponent {
  id: string;
  productId: string;
  productName: string;
  productUnit: string;
  quantity: number;
}

export default function NewKitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [kitNumber, setKitNumber] = useState("");
  const [kitType, setKitType] = useState("NORMAL");
  const [components, setComponents] = useState<KitComponent[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const result = await getAvailableProducts();
    if (result.success) {
      setProducts(result.data || []);
    }
  }

  function generateKitNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `KIT-${year}-${random}`;
  }

  function addComponent(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const existing = components.find((c) => c.productId === productId);
    if (existing) {
      toast.error("Ce produit est déjà ajouté");
      return;
    }

    setComponents([
      ...components,
      {
        id: Math.random().toString(36).substr(2, 9),
        productId: product.id,
        productName: product.name,
        productUnit: product.unit,
        quantity: 1,
      },
    ]);
  }

  function updateQuantity(id: string, quantity: number) {
    setComponents(
      components.map((c) =>
        c.id === id ? { ...c, quantity: Math.max(1, quantity) } : c
      )
    );
  }

  function removeComponent(id: string) {
    setComponents(components.filter((c) => c.id !== id));
  }

  async function handleSubmit() {
    if (!kitNumber.trim()) {
      toast.error("Le numéro de kit est requis");
      return;
    }

    if (components.length === 0) {
      toast.error("Ajoutez au moins un composant");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("kitNumber", kitNumber);
    formData.append("kitType", kitType);
    formData.append(
      "components",
      JSON.stringify(
        components.map((c) => ({
          productId: c.productId,
          quantity: c.quantity,
        }))
      )
    );

    const result = await createKit(formData);

    if (result.success) {
      toast.success("Kit créé avec succès");
      router.push("/kits");
    } else {
      toast.error(result.error || "Erreur lors de la création");
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/kits">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Retour</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nouveau Kit de Naissance</h1>
          <p className="text-muted-foreground">
            Créer un nouveau kit pour accouchement
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Kit Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du Kit</CardTitle>
            <CardDescription>
              Définissez le numéro et le type de kit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kitNumber">
                Numéro de kit <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="kitNumber"
                  value={kitNumber}
                  onChange={(e) => setKitNumber(e.target.value)}
                  placeholder="Ex: KIT-2025-001"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => setKitNumber(generateKitNumber())}
                  type="button"
                >
                  Générer
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kitType">Type de kit</Label>
              <Select value={kitType} onValueChange={setKitType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {kitTypeOptions.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {type.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Add Components */}
        <Card>
          <CardHeader>
            <CardTitle>Ajouter des composants</CardTitle>
            <CardDescription>
              Sélectionnez les produits à inclure dans le kit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={addComponent}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un produit..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>{product.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {product.unit}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Components List */}
      {components.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Composants du kit ({components.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {components.map((component) => (
                <div
                  key={component.id}
                  className="flex items-center gap-4 p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{component.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      Unité: {component.productUnit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`qty-${component.id}`} className="sr-only">
                      Quantité
                    </Label>
                    <Input
                      id={`qty-${component.id}`}
                      type="number"
                      min={1}
                      value={component.quantity}
                      onChange={(e) =>
                        updateQuantity(component.id, parseInt(e.target.value) || 1)
                      }
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground w-16">
                      {component.productUnit}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeComponent(component.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href="/kits">Annuler</Link>
        </Button>
        <Button onClick={handleSubmit} disabled={loading} size="lg">
          {loading ? (
            "Création..."
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Créer le kit
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
