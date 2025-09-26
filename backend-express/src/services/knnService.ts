import axios from "axios";

const RAW = process.env.KNN_URL || process.env.KNN_SERVICE_URL || process.env.NEXT_PUBLIC_KNN_URL;
const KNN_URL = RAW ? RAW.replace(/\/+$/, "") : "";

export async function fetchRecommendationsFromPython(data: { features: number[] }) {
  if (!KNN_URL) {
    // erro claro para não voltar 500 genérico
    throw new Error("KNN_URL não configurada. Defina KNN_URL no .env do backend.");
  }
  const url = `${KNN_URL}/predict`;
  try {
    const resp = await axios.post(url, data, { timeout: 10000 });
    return resp.data;
  } catch (err: any) {
    // propaga mensagem útil ao controlador
    const msg = err?.code === "ECONNREFUSED"
      ? `Não foi possível conectar ao KNN em ${url}`
      : err?.message || "Falha ao chamar o serviço KNN";
    const e = new Error(msg);
    (e as any).cause = err;
    throw e;
  }
}
