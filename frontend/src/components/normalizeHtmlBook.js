/**
 * Normalizes Project Gutenberg HTML books with better content preservation
 */
export function normalizeHtmlBook(rawHtml, options = {}) {
  const config = {
    preserveImages: true,
    preserveTables: true,
    preserveHeadings: true,
    preserveLinks: true,
    maxLineLength: 120,
    removeBoilerplate: true,
    generateToc: true,
    ...options
  };

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");
  
  // First, try to extract the main content area
  let mainContent = extractMainContent(doc, config);
  
  // If no main content found, use the body
  if (!mainContent) {
    mainContent = doc.body;
  }
  
  // Clean up but preserve structure
  const cleanedContent = cleanContent(mainContent, config);
  
  // Generate table of contents if requested
  let tocHtml = '';
  if (config.generateToc) {
    tocHtml = generateTableOfContents(cleanedContent);
  }
  
  // Build final HTML
  const contentHtml = buildContentHtml(cleanedContent, config);
  
  // Combine TOC and content
  let finalHtml = '';
  if (tocHtml) {
    finalHtml = `
      <div class="table-of-contents">
        <h2>Table of Contents</h2>
        ${tocHtml}
      </div>
      <hr class="toc-separator" />
      ${contentHtml}
    `;
  } else {
    finalHtml = contentHtml;
  }
  
  return finalHtml;
}

/**
 * Try to find the main content area in the document
 */
function extractMainContent(doc, config) {
  // Common Gutenberg content containers
  const contentSelectors = [
    '#pg-content',
    '.pg-content',
    '#content',
    '.content',
    '.chapter',
    '.body',
    '.book',
    '.novel',
    '.story',
    '.poem',
    'main',
    'article',
    '.main',
    '.article',
    '[role="main"]',
    '#main',
    '.text',
    '.textbody'
  ];
  
  for (const selector of contentSelectors) {
    const element = doc.querySelector(selector);
    if (element && element.textContent.trim().length > 500) {
      return element;
    }
  }
  
  // If no specific content area found, look for the largest text block
  const allElements = doc.querySelectorAll('body > *');
  let maxTextLength = 0;
  let mainElement = null;
  
  allElements.forEach(el => {
    const text = el.textContent.trim();
    if (text.length > maxTextLength && text.length > 1000) {
      maxTextLength = text.length;
      mainElement = el;
    }
  });
  
  return mainElement;
}

/**
 * Clean content while preserving structure
 */
function cleanContent(element, config) {
  const clone = element.cloneNode(true);
  
  // Remove specific boilerplate if requested
  if (config.removeBoilerplate) {
    const boilerplateSelectors = [
      // Project Gutenberg specific
      '[class*="gutenberg"]',
      '[id*="gutenberg"]',
      '[class*="pg"]',
      '[id*="pg"]',
      '.copyright',
      '.license',
      '.credits',
      '.endnote',
      '.endnotes',
      '.footnote',
      '.footnotes',
      '.annotation',
      '.transcriber',
      // Navigation that's not TOC
      '[class*="nav"]:not([class*="toc"]):not([class*="contents"])',
      '[id*="nav"]:not([id*="toc"]):not([id*="contents"])',
      // Ads and unnecessary elements
      '.advertisement',
      '.ad',
      '[class*="ad-"]',
      '.banner',
      '.promo',
      '.sidebar:not(.toc)',
      // Empty elements
      ':empty'
    ];
    
    boilerplateSelectors.forEach(selector => {
      clone.querySelectorAll(selector).forEach(el => {
        // Check if it's actually TOC before removing
        const isToc = el.className.includes('toc') || 
                     el.id.includes('toc') || 
                     el.textContent.match(/table of contents|contents/i);
        if (!isToc) {
          el.remove();
        }
      });
    });
    
    // Remove Project Gutenberg header/footer text
    const walker = document.createTreeWalker(
      clone,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent;
      if (text.match(/Project Gutenberg|EBOOK|START OF.*PROJECT|END OF.*PROJECT|Transcriber's Note/i)) {
        if (node.parentNode && node.parentNode.nodeType === Node.TEXT_NODE) {
          node.parentNode.remove();
        } else {
          node.textContent = text.replace(/Project Gutenberg|EBOOK|START OF.*PROJECT|END OF.*PROJECT|Transcriber's Note/gi, '');
        }
      }
    }
  }
  
  // Remove scripts and styles
  clone.querySelectorAll('script, style, link, meta').forEach(el => el.remove());
  
  // Optionally remove images
  if (!config.preserveImages) {
    clone.querySelectorAll('img, picture, svg, canvas').forEach(el => el.remove());
  }
  
  // Optionally remove tables
  if (!config.preserveTables) {
    clone.querySelectorAll('table, thead, tbody, tfoot, tr, td, th').forEach(el => el.remove());
  }
  
  // Optionally remove links (but keep TOC links)
  if (!config.preserveLinks) {
    clone.querySelectorAll('a:not([href*="#"]):not([href*="toc"])').forEach(el => {
      const text = document.createTextNode(el.textContent);
      el.parentNode.replaceChild(text, el);
    });
  }
  
  // Normalize whitespace but preserve paragraph structure
  const paragraphs = clone.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, blockquote, pre, li');
  paragraphs.forEach(p => {
    p.innerHTML = p.innerHTML
      .replace(/\s+/g, ' ')
      .replace(/^\s+|\s+$/g, '')
      .replace(/\n\s*\n/g, '\n');
  });
  
  // Add IDs to headings for navigation
  let headingCount = 0;
  clone.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading, index) => {
    if (!heading.id) {
      const text = heading.textContent.trim().toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      heading.id = text || `heading-${++headingCount}`;
    }
  });
  
  return clone;
}

/**
 * Generate table of contents from headings
 */
function generateTableOfContents(content) {
  const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headings.length < 3) return ''; // Don't generate TOC for very short content
  
  let tocItems = [];
  let currentLevel = 0;
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1));
    const text = heading.textContent.trim();
    const id = heading.id || `h${index}`;
    
    // Skip very short headings (likely page numbers)
    if (text.length < 3 || text.match(/^\d+$/)) return;
    
    // Add indentation based on heading level
    const indent = (level - 1) * 20;
    
    tocItems.push(`
      <div class="toc-item toc-level-${level}" style="margin-left: ${indent}px">
        <a href="#${id}" class="toc-link">${text}</a>
      </div>
    `);
  });
  
  if (tocItems.length === 0) return '';
  
  return `
    <div class="toc-container">
      ${tocItems.join('\n')}
    </div>
  `;
}

/**
 * Build final HTML with proper structure
 */
function buildContentHtml(content, config) {
  // If content already has good structure, return it
  const hasStructure = content.querySelector('h1, h2, h3, h4, h5, h6, p, div, section, article');
  if (hasStructure) {
    return content.innerHTML;
  }
  
  // Otherwise, wrap text in paragraphs
  const text = content.textContent;
  const paragraphs = text.split(/\n\s*\n+/);
  
  let html = '';
  let inChapter = false;
  
  paragraphs.forEach(paragraph => {
    const trimmed = paragraph.trim();
    if (!trimmed) return;
    
    // Check for chapter headings
    if (trimmed.match(/^CHAPTER|^Chapter|^CHAP\.|^Part|^Book|^\d+\./) && 
        trimmed.length < 100 && 
        !trimmed.includes('. ') && 
        !trimmed.includes('! ') && 
        !trimmed.includes('? ')) {
      
      html += `<h2 class="chapter-title">${trimmed}</h2>`;
      inChapter = true;
      return;
    }
    
    // Check for section breaks
    if (trimmed.match(/^\*{3,}$|^\* \* \*$|^_{3,}$|^-{3,}$/)) {
      html += `<hr class="section-break" />`;
      return;
    }
    
    // Regular paragraph
    const className = inChapter ? 'chapter-paragraph' : 'paragraph';
    html += `<p class="${className}">${trimmed}</p>`;
  });
  
  return html;
}

/**
 * Alternative simpler version that preserves most HTML
 */
export function normalizeHtmlBookSimple(rawHtml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");
  
  // Remove only the most intrusive elements
  const removeSelectors = [
    'script',
    'style',
    'link',
    'meta',
    'noscript',
    'iframe',
    'object',
    'embed',
    '.advertisement',
    '.ad',
    '[class*="ad-"]',
    '.banner',
    '.promo'
  ];
  
  removeSelectors.forEach(selector => {
    doc.querySelectorAll(selector).forEach(el => el.remove());
  });
  
  // Remove Project Gutenberg boilerplate text
  const walker = document.createTreeWalker(
    doc.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let node;
  while (node = walker.nextNode()) {
    const text = node.textContent;
    if (text.match(/Project Gutenberg|EBOOK|START OF.*PROJECT|END OF.*PROJECT/i)) {
      if (node.parentNode && node.parentNode.parentNode) {
        node.parentNode.remove();
      }
    }
  }
  
  // Add IDs to headings for navigation
  doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading, index) => {
    if (!heading.id) {
      heading.id = `h${index}`;
    }
  });
  
  return doc.body.innerHTML;
}