import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
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
