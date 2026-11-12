/**
 * Sanitiza HTML antes de injetar conteúdo gerado por IA / persistido no DOM.
 * Remove tags perigosas e atributos de evento/URL.
 */
export const sanitizeHtml = (dirty?: string | null): string => {
  if (!dirty) return "";
  const doc = new DOMParser().parseFromString(String(dirty), "text/html");
  doc.querySelectorAll("script, style, iframe, object, embed, link, meta, base, form").forEach((el) => el.remove());
  doc.querySelectorAll("*").forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = (attr.value || "").toLowerCase();
      if (name.startsWith("on")) {
        el.removeAttribute(attr.name);
      } else if (
        (name === "href" || name === "src") &&
        (value.trim().startsWith("javascript:") || value.trim().startsWith("data:text/html") || value.trim().startsWith("vbscript:"))
      ) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return doc.body.innerHTML;
};
