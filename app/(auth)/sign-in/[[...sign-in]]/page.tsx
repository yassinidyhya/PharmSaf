import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconShieldCheck, IconArrowRight, IconBuildingHospital } from "@tabler/icons-react";

const isMockMode = process.env.USE_MOCK_DATA === "true";

export default async function SignInPage() {
  if (isMockMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3">
              <IconBuildingHospital className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Pharmacie Provinciale
            </h1>
            <p className="text-slate-600">Délégation Médicale Essaouira</p>
          </div>

          <Card className="shadow-lg border-slate-200">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Connexion</CardTitle>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  Mode Démo
                </Badge>
              </div>
              <CardDescription>
                L&apos;application s&apos;exécute actuellement avec les données de démonstration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Utilisateur :</span>
                  <span className="font-medium text-foreground">Pharmacien Essaouira</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Email :</span>
                  <span className="font-mono text-foreground">demo@pharmasaf.ma</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Rôle :</span>
                  <span className="font-medium text-emerald-700">Administrateur</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full gap-2">
                <Link href="/">
                  <span>Accéder au Tableau de Bord</span>
                  <IconArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  const { SignIn } = await import("@clerk/nextjs");

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Pharmacie Provinciale
          </h1>
          <p className="text-slate-600">Essaouira</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              card: "shadow-lg border border-slate-200",
              headerTitle: "text-slate-900",
              headerSubtitle: "text-slate-600",
            },
          }}
        />
      </div>
    </div>
  );
}
