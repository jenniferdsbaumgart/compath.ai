"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useProtectedRoute } from "@/hooks/protected-route";

export default function TrainModelPage() {
  useProtectedRoute();
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const handleRetrain = async () => {
    setStatus("loading");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_KNN_URL}/retrain`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro da API:", errorText);
        setStatus("error");
        return;
      }

      const data = await response.json();
      console.log("Resposta:", data);
      setAccuracy(data.accuracy);
      setStatus("success");
    } catch (err) {
      console.error("Erro ao re-treinar modelo:", err);
      setStatus("error");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-6">
      <h1 className="text-2xl font-bold">Re-treinar Modelo de Recomendação</h1>
      <Button onClick={handleRetrain} disabled={status === "loading"}>
        <span>Re-treinar</span>
        {status === "loading" && (
          <p className="text-blue-500">Treinando modelo...</p>
        )}
        {status === "success" && (
          <p className="text-green-500">
            Modelo treinado com sucesso! Acurácia: {accuracy}
          </p>
        )}
        {status === "error" && (
          <p className="text-red-500">
            Erro ao treinar o modelo. Verifique o console.
          </p>
        )}
      </Button>
      {status === "success" && (
        <p className="text-green-600">
          ✅ Acurácia do novo modelo: {accuracy?.toFixed(2)}
        </p>
      )}
      {status === "error" && (
        <p className="text-red-600">❌ Erro ao treinar o modelo</p>
      )}
    </div>
  );
}
