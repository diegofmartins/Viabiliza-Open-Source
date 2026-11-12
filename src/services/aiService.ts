import { ETPData, ETPField } from "../types";

/**
 * 1. AI Assist for a single field via server backend
 */
export async function requestAiAssist(params: {
  fieldId: ETPField;
  fieldName?: string;
  instruction?: string;
  formData: ETPData;
  customApiKey?: string;
}): Promise<string> {
  const { fieldId, fieldName, instruction, formData, customApiKey } = params;

  const res = await fetch("/api/ai/assist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fieldId,
      fieldName,
      instruction: instruction || "",
      formData,
      customApiKey
    })
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || "Falha ao processar assistente de campo no servidor.");
  }

  const json = await res.json();
  if (json.text) {
    return json.text;
  }
  throw new Error("O servidor não retornou texto.");
}

/**
 * 2. Complete Global ETP Generation via server backend
 */
export async function requestAiGenerateGlobal(params: {
  formData: ETPData;
  customApiKey?: string;
}): Promise<Partial<ETPData>> {
  const { formData, customApiKey } = params;

  const res = await fetch("/api/ai/generate-global", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      diag_problema_necessidade: formData.diag_problema_necessidade || "",
      diag_alternativas_solucao: formData.diag_alternativas_solucao || "",
      diag_objeto_vigencia: formData.diag_objeto_vigencia || "",
      diag_exigencias_padroes: formData.diag_exigencias_padroes || "",
      diag_quantidades_valor: formData.diag_quantidades_valor || "",
      diag_parcelamento_providencias: formData.diag_parcelamento_providencias || "",
      diag_correlatas_ambientais: formData.diag_correlatas_ambientais || "",
      diag_riscos_sucesso: formData.diag_riscos_sucesso || "",
      customApiKey
    })
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || "Falha na geração global no servidor.");
  }

  const json = await res.json();
  if (json.combinedData) {
    return json.combinedData;
  }
  throw new Error("O servidor retornou dados vazios.");
}
