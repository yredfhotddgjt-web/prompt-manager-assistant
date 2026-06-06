if (!globalThis.__zeroGetPromptCollectorInstalled) {
  globalThis.__zeroGetPromptCollectorInstalled = true;
  globalThis.__zeroGetPromptLastContextTarget = null;

  document.addEventListener(
    "contextmenu",
    (event) => {
      globalThis.__zeroGetPromptLastContextTarget = event.target instanceof Element ? event.target : null;
    },
    true
  );
}

function normalizeText(text) {
  return text.replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function dedupe(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function getSelectionRange() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return null;
  }

  return selection.getRangeAt(0);
}

function getAnchorElement(range) {
  const rangeElement =
    range?.commonAncestorContainer instanceof Element
      ? range.commonAncestorContainer
      : range?.commonAncestorContainer?.parentElement || null;

  return globalThis.__zeroGetPromptLastContextTarget || rangeElement || document.body;
}

function resolveUrl(url) {
  if (!url) {
    return "";
  }

  if (/^(https?:|data:|blob:)/.test(url)) {
    return url;
  }

  try {
    return new URL(url, location.href).href;
  } catch (_error) {
    return "";
  }
}

function firstUrlFromSrcset(srcset) {
  if (!srcset) {
    return "";
  }

  const firstCandidate = srcset.split(",")[0]?.trim().split(/\s+/)[0] || "";
  return resolveUrl(firstCandidate);
}

function imageUrlFromElement(image) {
  return resolveUrl(
    image.getAttribute("data-canonical-src") ||
      image.currentSrc ||
      image.getAttribute("src") ||
      ""
  );
}

function urlsFromCssImage(value) {
  if (!value || value === "none") {
    return [];
  }

  const urls = [];
  const pattern = /url\((["']?)(.*?)\1\)/g;
  let match;
  while ((match = pattern.exec(value))) {
    const url = resolveUrl(match[2]);
    if (url) {
      urls.push(url);
    }
  }
  return urls;
}

function getElementRect(element) {
  const rect = element.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return null;
  }

  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height
  };
}

function scoreImage(image) {
  const width = Number(image.getAttribute("width")) || image.naturalWidth || image.clientWidth || 0;
  const height = Number(image.getAttribute("height")) || image.naturalHeight || image.clientHeight || 0;
  const area = width * height;
  const text = [
    image.alt,
    image.getAttribute("aria-label"),
    image.className,
    imageUrlFromElement(image)
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;
  if (area >= 60000) {
    score += 8;
  } else if (area >= 10000) {
    score += 4;
  }

  if (width >= 220 || height >= 160) {
    score += 4;
  }

  if (/license|badge|shield|avatar|icon|emoji|logo|button/.test(text)) {
    score -= 12;
  }

  return score;
}

function getImageRect(image) {
  return getElementRect(image);
}

function scoreVisualElement(element, url = "") {
  const rect = getElementRect(element);
  const area = rect ? rect.width * rect.height : 0;
  const text = [
    element.getAttribute?.("aria-label"),
    element.getAttribute?.("class"),
    element.getAttribute?.("role"),
    url
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;
  if (area >= 60000) {
    score += 8;
  } else if (area >= 10000) {
    score += 4;
  }

  if (rect && (rect.width >= 220 || rect.height >= 160)) {
    score += 4;
  }

  if (/license|badge|shield|avatar|icon|emoji|logo|button/.test(text)) {
    score -= 12;
  }

  return score;
}

function getLimitedDescendants(element, limit = 220) {
  const descendants = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT);
  let current = walker.nextNode();

  while (current && descendants.length < limit) {
    descendants.push(current);
    current = walker.nextNode();
  }

  return descendants;
}

function isVisibleEnough(element) {
  const rect = getElementRect(element);
  if (!rect) {
    return false;
  }

  return rect.width >= 48 && rect.height >= 48;
}

function collectImageCandidatesFromElements(elements) {
  const candidates = [];

  for (const element of elements) {
    if (!(element instanceof Element)) {
      continue;
    }

    const images = element.matches("img")
      ? [element]
      : Array.from(element.querySelectorAll("img"));

    for (const image of images) {
      const url = imageUrlFromElement(image);
      if (url) {
        candidates.push({ url, score: scoreImage(image), rect: getImageRect(image) });
      }
    }

    const sources = element.matches("source")
      ? [element]
      : Array.from(element.querySelectorAll("source"));
    for (const source of sources) {
      const url = firstUrlFromSrcset(source.getAttribute("srcset") || "");
      if (url) {
        candidates.push({ url, score: 3, rect: getElementRect(source.closest("picture") || element) });
      }
    }

    const links = element.matches("a") ? [element] : Array.from(element.querySelectorAll("a"));
    for (const link of links) {
      const href = resolveUrl(link.getAttribute("href") || "");
      if (/\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(href)) {
        candidates.push({ url: href, score: 2, rect: null });
      }
    }

    const backgroundElements = [element, ...getLimitedDescendants(element)].filter(isVisibleEnough);
    for (const backgroundElement of backgroundElements) {
      const style = getComputedStyle(backgroundElement);
      for (const url of urlsFromCssImage(style.backgroundImage)) {
        candidates.push({
          url,
          score: scoreVisualElement(backgroundElement, url),
          rect: getElementRect(backgroundElement)
        });
      }
    }

    const visualElements = backgroundElements.filter((visualElement) =>
      visualElement.matches?.("canvas, video, svg, [role='img']")
    );
    for (const visualElement of visualElements) {
      candidates.push({
        url: "",
        score: scoreVisualElement(visualElement),
        rect: getElementRect(visualElement)
      });
    }
  }

  const seen = new Set();
  return candidates
    .sort((left, right) => right.score - left.score)
    .filter((candidate) => candidate.score > -8)
    .filter((candidate) => {
      if (seen.has(candidate.url)) {
        return false;
      }
      seen.add(candidate.url);
      return true;
    });
}

function getRangeRect(range) {
  if (!range) {
    return null;
  }

  const rects = Array.from(range.getClientRects()).filter((rect) => rect.width && rect.height);
  if (rects.length === 0) {
    return null;
  }

  const left = Math.min(...rects.map((rect) => rect.left));
  const top = Math.min(...rects.map((rect) => rect.top));
  const right = Math.max(...rects.map((rect) => rect.right));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top
  };
}

function collectImagesFromElements(elements) {
  return collectImageCandidatesFromElements(elements).map((candidate) => candidate.url);
}

function collectImagesIntersectingRange(range) {
  if (!range) {
    return [];
  }

  const images = Array.from(document.images).filter((image) => {
    try {
      return range.intersectsNode(image);
    } catch (_error) {
      return false;
    }
  });

  return collectImagesFromElements(images);
}

function collectImageCandidatesIntersectingRange(range) {
  if (!range) {
    return [];
  }

  const images = Array.from(document.images).filter((image) => {
    try {
      return range.intersectsNode(image);
    } catch (_error) {
      return false;
    }
  });

  return collectImageCandidatesFromElements(images);
}

function getSelectedFragmentElements(range) {
  if (!range) {
    return [];
  }

  const fragment = range.cloneContents();
  return Array.from(fragment.children);
}

function findUsefulContainer(anchorElement, selectedText) {
  const needle = selectedText.slice(0, Math.min(80, selectedText.length));
  const candidates = [];
  let current = anchorElement;

  while (current && current !== document.body) {
    const text = normalizeText(current.innerText || "");
    const hasSelectionText = needle && text.includes(needle);
    const imageCount = current.querySelectorAll?.("img").length || 0;
    const isSemanticContainer = current.matches?.(
      "article, section, [role='article'], li, .card, .post, .entry, .content, .markdown-body, .prose"
    );

    if (hasSelectionText || imageCount > 0 || isSemanticContainer) {
      candidates.push({
        element: current,
        textLength: text.length,
        imageCount,
        hasSelectionText,
        isSemanticContainer
      });
    }

    current = current.parentElement;
  }

  const withTextAndImages = candidates.find(
    (candidate) => candidate.hasSelectionText && candidate.imageCount > 0 && candidate.textLength <= 12000
  );
  if (withTextAndImages) {
    return withTextAndImages.element;
  }

  const smallTextContainer = candidates.find(
    (candidate) => candidate.hasSelectionText && candidate.textLength <= 5000
  );
  if (smallTextContainer) {
    return smallTextContainer.element;
  }

  const semanticContainer = candidates.find(
    (candidate) => candidate.isSemanticContainer && candidate.textLength <= 12000
  );
  if (semanticContainer) {
    return semanticContainer.element;
  }

  return anchorElement;
}

function findHeadingInContainer(container, anchorElement) {
  if (!(container instanceof Element)) {
    return "";
  }

  const headings = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6")).filter((heading) =>
    normalizeText(heading.textContent || "")
  );

  if (headings.length === 0) {
    return "";
  }

  const anchorPosition = anchorElement.compareDocumentPosition.bind(anchorElement);
  const precedingHeading = headings
    .filter((heading) => {
      const position = anchorPosition(heading);
      return Boolean(position & Node.DOCUMENT_POSITION_PRECEDING || heading.contains(anchorElement));
    })
    .at(-1);

  return normalizeText((precedingHeading || headings[0]).textContent || "");
}

function nearestHeadingText(anchorElement) {
  const directHeading = anchorElement.closest?.("h1, h2, h3, h4, h5, h6");
  if (directHeading) {
    return normalizeText(directHeading.textContent || "");
  }

  let current = anchorElement;
  while (current && current !== document.body) {
    let sibling = current.previousElementSibling;
    while (sibling) {
      if (sibling.matches?.("h1, h2, h3, h4, h5, h6")) {
        return normalizeText(sibling.textContent || "");
      }
      const heading = sibling.querySelector?.("h1, h2, h3, h4, h5, h6");
      if (heading) {
        return normalizeText(heading.textContent || "");
      }
      sibling = sibling.previousElementSibling;
    }
    current = current.parentElement;
  }

  return "";
}

function splitTitleAndContent(selectedText, anchorElement, container) {
  const lines = selectedText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const containerHeading = findHeadingInContainer(container, anchorElement);
  const heading = containerHeading || nearestHeadingText(anchorElement);

  if (heading && lines[0] === heading) {
    return {
      title: heading,
      content: lines.slice(1).join("\n\n").trim()
    };
  }

  if (lines.length >= 2 && lines[0].length <= 140) {
    return {
      title: lines[0],
      content: lines.slice(1).join("\n\n").trim()
    };
  }

  if (heading && selectedText.startsWith(heading)) {
    return {
      title: heading,
      content: selectedText.slice(heading.length).trim()
    };
  }

  if (heading) {
    return {
      title: heading,
      content: selectedText
    };
  }

  return {
    title: lines[0]?.slice(0, 120) || "",
    content: lines.length > 1 ? lines.slice(1).join("\n\n").trim() : selectedText
  };
}

async function collectStructuredSelection() {
  const range = getSelectionRange();
  const selectedText = normalizeText(range?.toString() || "");
  const anchorElement = getAnchorElement(range);
  const container = findUsefulContainer(anchorElement, selectedText);
  const { title, content } = splitTitleAndContent(selectedText, anchorElement, container);
  const selectedFragmentCandidates = collectImageCandidatesFromElements(getSelectedFragmentElements(range));
  const intersectingCandidates = collectImageCandidatesIntersectingRange(range);
  const imageCandidates = [...selectedFragmentCandidates, ...intersectingCandidates];
  const dedupedCandidates = [];
  const seenUrls = new Set();
  for (const candidate of imageCandidates.sort((left, right) => right.score - left.score)) {
    if (candidate.url && seenUrls.has(candidate.url)) {
      continue;
    }
    if (candidate.url) {
      seenUrls.add(candidate.url);
    }
    dedupedCandidates.push(candidate);
  }

  const imageUrls = dedupedCandidates.map((candidate) => candidate.url).filter(Boolean);

  return {
    ok: Boolean(title || content || imageUrls.length),
    title,
    content,
    imageUrls,
    imageCandidates: dedupedCandidates,
    hasExplicitImageSelection: imageCandidates.length > 0,
    devicePixelRatio: window.devicePixelRatio || 1,
    usedSelectionText: Boolean(selectedText)
  };
}

globalThis.__zeroGetPromptCollectStructuredSelection = collectStructuredSelection;

if (!globalThis.__zeroGetPromptMessageListenerInstalled) {
  globalThis.__zeroGetPromptMessageListenerInstalled = true;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "GET_STRUCTURED_SELECTION") {
      return;
    }

    globalThis.__zeroGetPromptCollectStructuredSelection()
      .then((result) => {
        sendResponse(result);
      })
      .catch((error) => {
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : String(error)
        });
      });

    return true;
  });
}
