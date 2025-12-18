export function normalizeHtmlBook(rawHtml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");

  /* REMOVE JUNK TAGS */
  doc.querySelectorAll(
    "script, style, iframe, link, meta, noscript"
  ).forEach(el => el.remove());

  /* REMOVE INLINE STYLES & ATTRIBUTES */
  doc.querySelectorAll("*").forEach(el => {
    el.removeAttribute("style");
    el.removeAttribute("class");
    el.removeAttribute("width");
    el.removeAttribute("height");
    el.removeAttribute("align");
    el.removeAttribute("bgcolor");
  });

  /* FIX BAD TAGS */
  doc.querySelectorAll("font").forEach(el => {
    const p = doc.createElement("p");
    p.innerHTML = el.innerHTML;
    el.replaceWith(p);
  });

  doc.querySelectorAll("center").forEach(el => {
    el.style.textAlign = "center";
  });

  /* REMOVE EMPTY PARAGRAPHS */
  doc.querySelectorAll("p").forEach(p => {
    if (!p.textContent.trim()) p.remove();
  });

  /* ADD CLEAN READER CSS */
  const style = doc.createElement("style");
  style.textContent = `
    body {
      margin: 0;
      padding: 0;
      background: transparent;
      font-family: Georgia, "Times New Roman", serif;
    }

    h1, h2, h3 {
      margin: 2.5rem 0 1.5rem;
      font-weight: 700;
    }

    p {
      margin: 0 0 1.4em;
      text-align: justify;
      word-break: break-word;
    }

    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 1.5rem auto;
    }

    blockquote {
      border-left: 4px solid #999;
      padding-left: 1rem;
      opacity: 0.85;
      margin: 1.5rem 0;
    }
  `;

  doc.head.appendChild(style);

  return doc.body.innerHTML;
}
