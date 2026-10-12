/**
 * Helper to safely parse JSON responses from the server.
 * If the response is not valid JSON (e.g., an HTML error page from a gateway or Vite),
 * it returns a user-friendly error message instead of throwing the default JSON parse error.
 */
export async function safeFetchJson(response: Response): Promise<any> {
  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  if (!isJson) {
    const text = await response.text();
    // Check if it's an HTML error page (usually starts with <)
    if (text.trim().startsWith("<")) {
      throw new Error(`Le serveur Bank M3ak est temporairement indisponible (Code ${response.status}). Veuillez réessayer dans quelques instants.`);
    }
    throw new Error(text || `Erreur de communication (Code ${response.status})`);
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Une erreur est survenue (Code ${response.status})`);
  }

  return data;
}
