"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  Building2,
  Printer,
  CheckSquare,
  Square,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getKit, getHospitalsForDistribution, verifyComponent, distributeKit } from "../actions";
import { formatDate } from "@/lib/utils";

const kitTypeLabels: Record<string, string> = {
  NORMAL: "Accouchement normal",
  EPISIOTOMIE: "Épisiotomie",
};

export default function KitDetailPage() {
  const params = useParams();
  const kitId = params.id as string;

  const [kit, setKit] = useState<any>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [loading, setLoading] = useState(true);
  const [distributeDialogOpen, setDistributeDialogOpen] = useState(false);

  useEffect(() => {
    loadKit();
    loadHospitals();
  }, [kitId]);

  async function loadKit() {
    setLoading(true);
    const result = await getKit(kitId);
    if (result.success) {
      setKit(result.data);
    }
    setLoading(false);
  }

  async function loadHospitals() {
    const result = await getHospitalsForDistribution();
    if (result.success) {
      setHospitals(result.data || []);
    }
  }

  async function handleVerifyComponent(componentId: string, checked: boolean) {
    const result = await verifyComponent(kitId, componentId, checked);
    if (result.success) {
      toast.success(checked ? "Composant vérifié" : "Composant non vérifié");
      loadKit();
      if (result.isComplete) {
        toast.success("Kit maintenant complet !");
      }
    } else {
      toast.error("Erreur lors de la vérification");
    }
  }

  async function handleDistribute() {
    if (!selectedHospital) {
      toast.error("Sélectionnez un hôpital");
      return;
    }

    const result = await distributeKit(kitId, selectedHospital);
    if (result.success) {
      toast.success("Kit distribué avec succès");
      setDistributeDialogOpen(false);
      loadKit();
    } else {
      toast.error(result.error || "Erreur lors de la distribution");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <p className="text-center py-8">Chargement...</p>
      </div>
    );
  }

  if (!kit) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <p className="text-center py-8">Kit non trouvé</p>
      </div>
    );
  }

  const allComponentsPresent = kit.components.every((c: any) => c.isPresent);
  const canDistribute = kit.isComplete && !kit.isDistributed;

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
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Kit {kit.kitNumber}
          </h1>
          <p className="text-muted-foreground">
            {kitTypeLabels[kit.kitType]}
          </p>
        </div>
        <div className="flex gap-2">
          {kit.isComplete && (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="mr-1 h-3 w-3" />
              Complet
            </Badge>
          )}
          {kit.isDistributed && (
            <Badge variant="default" className="bg-blue-600">
              <Truck className="mr-1 h-3 w-3" />
              Distribué
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kit Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Numéro de kit</p>
              <p className="font-medium text-lg">{kit.kitNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium">{kitTypeLabels[kit.kitType]}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Créé le</p>
              <p className="font-medium">{formatDate(kit.createdAt)}</p>
            </div>
            {kit.isDistributed && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Distribué le</p>
                  <p className="font-medium">{formatDate(kit.distributedAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">À</p>
                  <p className="font-medium">{kit.hospitalId}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Statut</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Complétude</span>
              {kit.isComplete ? (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Complet
                </Badge>
              ) : (
                <Badge variant="outline" className="text-orange-600">
                  <XCircle className="mr-1 h-3 w-3" />
                  Incomplet
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Distribution</span>
              {kit.isDistributed ? (
                <Badge variant="default" className="bg-blue-600">
                  <Truck className="mr-1 h-3 w-3" />
                  Distribué
                </Badge>
              ) : (
                <Badge variant="outline">Non distribué</Badge>
              )}
            </div>
            <div className="pt-4">
              <div className="text-sm text-muted-foreground mb-2">
                Progression
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(kit.components.filter((c: any) => c.isPresent).length / kit.components.length) * 100}%`,
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {kit.components.filter((c: any) => c.isPresent).length} / {kit.components.length} vérifiés
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {canDistribute && (
              <Dialog open={distributeDialogOpen} onOpenChange={setDistributeDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" size="lg">
                    <Truck className="mr-2 h-4 w-4" />
                    Distribuer le kit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Distribuer le kit</DialogTitle>
                    <DialogDescription>
                      Sélectionnez l&apos;hôpital destinataire. Cette action réduira le stock.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="hospital">Hôpital</Label>
                    <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un hôpital..." />
                      </SelectTrigger>
                      <SelectContent>
                        {hospitals.map((hospital) => (
                          <SelectItem key={hospital.id} value={hospital.id}>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              {hospital.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDistributeDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleDistribute}>
                      Confirmer la distribution
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {!kit.isComplete && (
              <Button variant="outline" className="w-full" disabled>
                <CheckCircle className="mr-2 h-4 w-4" />
                Complétez la vérification pour distribuer
              </Button>
            )}

            {kit.isDistributed && (
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/kits/${kitId}/pdf`}>
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimer le bon
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Components List */}
      <Card>
        <CardHeader>
          <CardTitle>Composants ({kit.components.length})</CardTitle>
          <CardDescription>
            Vérifiez la présence de chaque composant dans le kit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {kit.components.map((component: any) => (
              <div
                key={component.id}
                className={`flex items-center gap-4 p-4 border rounded-lg ${
                  component.isPresent ? "bg-green-50 border-green-200" : "bg-muted/50"
                }`}
              >
                {!kit.isDistributed && (
                  <Checkbox
                    id={`component-${component.id}`}
                    checked={component.isPresent}
                    onCheckedChange={(checked) =>
                      handleVerifyComponent(component.id, checked as boolean)
                    }
                  />
                )}
                {kit.isDistributed && (
                  component.isPresent ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )
                )}
                <div className="flex-1">
                  <Label
                    htmlFor={`component-${component.id}`}
                    className="font-medium cursor-pointer"
                  >
                    {component.product.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Code: {component.product.code} • Quantité: {component.quantity} {component.product.unit}
                  </p>
                </div>
                <Badge variant={component.isPresent ? "default" : "outline"}>
                  {component.isPresent ? "Présent" : "Manquant"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
