const CONTEXT_MENU_ID = "save-selection-to-0get";
const PENDING_SELECTION_KEY = "pendingSelectionDraft";

async function setupExtensionUi() {
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  await chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: "\u4fdd\u5b58\u4e3a Prompt",
    contexts: ["selection", "image"]
  });
}

async function getStructuredSelection(tabId) {
  if (!tabId) {
    return null;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content-script.js"]
    });

    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => globalThis.__zeroGetPromptCollectStructuredSelection?.() || null
    });

    return result?.result?.ok ? result.result : null;
  } catch (_error) {
    return null;
  }
}

async function captureVisibleTabFallback(tab, structuredSelection) {
  const primaryCandidate = structuredSelection?.imageCandidates?.find((candidate) => candidate.rect);
  if (!tab?.windowId || !primaryCandidate?.rect) {
    return {};
  }

  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: "png"
    });

    return {
      screenshotDataUrl: dataUrl,
      screenshotRect: primaryCandidate.rect,
      screenshotDevicePixelRatio: structuredSelection.devicePixelRatio || 1
    };
  } catch (_error) {
    return {};
  }
}

function mergePromptDraft(previousDraft, incomingDraft) {
  const previousContent = previousDraft.content?.trim() || "";
  const incomingContent = incomingDraft.content?.trim() || "";
  const mergedContent = [previousContent, incomingContent].filter(Boolean).join("\n\n").trim();

  return {
    ...previousDraft,
    ...incomingDraft,
    content: mergedContent,
    suggestedTitle: previousDraft.suggestedTitle || incomingDraft.suggestedTitle || "新建 Prompt",
    imageUrls: Array.from(new Set([...(previousDraft.imageUrls || []), ...(incomingDraft.imageUrls || [])])),
    primaryImageUrl:
      incomingDraft.primaryImageUrl ||
      previousDraft.primaryImageUrl ||
      incomingDraft.imageUrls?.[0] ||
      previousDraft.imageUrls?.[0] ||
      "",
    capturedAt: new Date().toISOString()
  };
}

function createPromptDraft(incomingDraft) {
  return {
    ...incomingDraft,
    content: incomingDraft.content?.trim() || "",
    suggestedTitle: incomingDraft.suggestedTitle || "新建 Prompt",
    imageUrls: Array.from(new Set(incomingDraft.imageUrls || [])),
    primaryImageUrl: incomingDraft.primaryImageUrl || incomingDraft.imageUrls?.[0] || "",
    capturedAt: new Date().toISOString()
  };
}

setupExtensionUi().catch((error) => {
  console.error("Failed to initialize extension UI", error);
});

chrome.runtime.onInstalled.addListener(async () => {
  await setupExtensionUi();
});

chrome.runtime.onStartup.addListener(async () => {
  await setupExtensionUi();
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID) {
    return;
  }

  const structuredSelection = await getStructuredSelection(tab?.id);
  const screenshotFallback = await captureVisibleTabFallback(tab, structuredSelection);
  const normalizedText = info.selectionText?.trim() || "";
  const imageUrlsFromClick = info.srcUrl ? [info.srcUrl] : [];

  if (!normalizedText && !structuredSelection?.ok && imageUrlsFromClick.length === 0) {
    return;
  }

  const captureMode =
    structuredSelection?.title || structuredSelection?.content || (structuredSelection?.imageUrls || []).length > 0
      ? "structured-section"
      : info.srcUrl
        ? "image-append"
        : "text-append";

  const incomingDraft = {
    source: info.srcUrl ? "context-menu-image" : "context-menu-selection",
    captureMode,
    content: structuredSelection?.content || normalizedText,
    suggestedTitle:
      structuredSelection?.title ||
      normalizedText.split(/\s+/).slice(0, 8).join(" ").slice(0, 80) ||
      tab?.title?.slice(0, 80) ||
      "新建 Prompt",
    imageUrls: [...(structuredSelection?.imageUrls || []), ...imageUrlsFromClick],
    primaryImageUrl: structuredSelection?.imageUrls?.[0] || imageUrlsFromClick[0] || "",
    ...screenshotFallback,
    pageTitle: tab?.title || "",
    pageUrl: tab?.url || ""
  };

  const existing = await chrome.storage.local.get(PENDING_SELECTION_KEY);
  const previousDraft = existing[PENDING_SELECTION_KEY] || {};
  const draft =
    captureMode === "structured-section"
      ? createPromptDraft(incomingDraft)
      : mergePromptDraft(previousDraft, incomingDraft);

  await chrome.storage.local.set({ [PENDING_SELECTION_KEY]: draft });

  if (tab?.windowId) {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  }
});
