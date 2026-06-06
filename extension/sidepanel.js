import {
  createCategory,
  deleteCategory,
  deletePrompt,
  getCategories,
  getPrompts,
  savePrompt
} from "./lib/db.js";

const state = {
  prompts: [],
  categories: [],
  search: "",
  activeCategoryId: "all",
  editingPromptId: null,
  stagedImageBlob: null,
  stagedImageUrl: null,
  detailPromptId: null,
  detailImageUrl: null,
  lightboxImageUrl: null,
  pendingDraftSignature: "",
  appliedDraftContent: "",
  appliedDraftImageUrl: "",
  lastAppliedCaptureMode: ""
};

const PENDING_SELECTION_KEY = "pendingSelectionDraft";

const elements = {
  promptList: document.querySelector("#prompt-list"),
  emptyState: document.querySelector("#empty-state"),
  stats: document.querySelector("#stats"),
  categoryFilters: document.querySelector("#category-filters"),
  searchInput: document.querySelector("#search-input"),
  openFormButton: document.querySelector("#open-form-button"),
  editorDialog: document.querySelector("#editor-dialog"),
  promptForm: document.querySelector("#prompt-form"),
  dialogTitle: document.querySelector("#dialog-title"),
  titleInput: document.querySelector("#title-input"),
  promptId: document.querySelector("#prompt-id"),
  categorySelect: document.querySelector("#category-select"),
  contentInput: document.querySelector("#content-input"),
  captureStatus: document.querySelector("#capture-status"),
  imageDropzone: document.querySelector("#image-dropzone"),
  imageInput: document.querySelector("#image-input"),
  imagePreviewWrap: document.querySelector("#image-preview-wrap"),
  imagePreview: document.querySelector("#image-preview"),
  removeImageButton: document.querySelector("#remove-image-button"),
  deleteButton: document.querySelector("#delete-button"),
  closeDialogButton: document.querySelector("#close-dialog-button"),
  manageCategoriesButton: document.querySelector("#manage-categories-button"),
  categoryDialog: document.querySelector("#category-dialog"),
  categoryForm: document.querySelector("#category-form"),
  categoryNameInput: document.querySelector("#category-name-input"),
  categoryList: document.querySelector("#category-list"),
  closeCategoryDialogButton: document.querySelector("#close-category-dialog-button"),
  detailDialog: document.querySelector("#detail-dialog"),
  closeDetailDialogButton: document.querySelector("#close-detail-dialog-button"),
  detailCategory: document.querySelector("#detail-category"),
  detailTitle: document.querySelector("#detail-title"),
  detailImageButton: document.querySelector("#detail-image-button"),
  detailImage: document.querySelector("#detail-image"),
  detailContent: document.querySelector("#detail-content"),
  detailCopyButton: document.querySelector("#detail-copy-button"),
  detailEditButton: document.querySelector("#detail-edit-button"),
  imageLightboxDialog: document.querySelector("#image-lightbox-dialog"),
  closeLightboxButton: document.querySelector("#close-lightbox-button"),
  lightboxImage: document.querySelector("#lightbox-image"),
  promptCardTemplate: document.querySelector("#prompt-card-template")
};

async function bootstrap() {
  await navigator.storage?.persist?.();
  await refreshData();
  bindEvents();
  render();
  await applyPendingSelectionDraft();
}

function bindEvents() {
  elements.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderPromptList();
    renderStats();
  });

  elements.openFormButton.addEventListener("click", () => openPromptDialog());
  elements.closeDialogButton.addEventListener("click", closePromptDialog);

  elements.promptForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await handlePromptSubmit();
    } catch (error) {
      window.alert(error.message);
    }
  });

  elements.imageInput.addEventListener("change", handleImageSelection);
  elements.imageDropzone.addEventListener("dragenter", handleDragState);
  elements.imageDropzone.addEventListener("dragover", handleDragState);
  elements.imageDropzone.addEventListener("dragleave", handleDragLeave);
  elements.imageDropzone.addEventListener("drop", handleImageDrop);
  elements.removeImageButton.addEventListener("click", clearStagedImage);

  elements.deleteButton.addEventListener("click", async () => {
    if (!state.editingPromptId) {
      return;
    }
    await deletePrompt(state.editingPromptId);
    closePromptDialog();
    await refreshData();
    render();
  });

  elements.manageCategoriesButton.addEventListener("click", () => {
    renderCategoryManager();
    elements.categoryDialog.showModal();
  });

  elements.closeCategoryDialogButton.addEventListener("click", () => {
    elements.categoryDialog.close();
  });

  elements.closeDetailDialogButton.addEventListener("click", closeDetailDialog);
  elements.detailDialog.addEventListener("close", () => {
    state.detailPromptId = null;
    revokeDetailImageUrl();
  });
  elements.detailCopyButton.addEventListener("click", handleDetailCopy);
  elements.detailEditButton.addEventListener("click", handleDetailEdit);
  elements.detailImageButton.addEventListener("click", openImageLightbox);
  elements.closeLightboxButton.addEventListener("click", closeImageLightbox);
  elements.imageLightboxDialog.addEventListener("close", () => {
    if (state.lightboxImageUrl) {
      URL.revokeObjectURL(state.lightboxImageUrl);
    }
    state.lightboxImageUrl = null;
    elements.lightboxImage.removeAttribute("src");
  });
  elements.imageLightboxDialog.addEventListener("click", (event) => {
    if (event.target === elements.imageLightboxDialog) {
      closeImageLightbox();
    }
  });

  elements.categoryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await createCategory(elements.categoryNameInput.value);
      elements.categoryNameInput.value = "";
      await refreshData();
      renderCategorySelect();
      renderCategoryFilters();
      renderCategoryManager();
    } catch (error) {
      window.alert(error.message);
    }
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[PENDING_SELECTION_KEY]?.newValue) {
      return;
    }

    applyPendingSelectionDraft();
  });
}

async function refreshData() {
  const [categories, prompts] = await Promise.all([getCategories(), getPrompts()]);
  state.categories = categories.sort((left, right) => left.name.localeCompare(right.name, "zh-Hans-CN"));
  state.prompts = prompts;
}

function render() {
  renderCategorySelect();
  renderCategoryFilters();
  renderCategoryManager();
  renderStats();
  renderPromptList();
}

function renderStats() {
  const visibleCount = getFilteredPrompts().length;
  elements.stats.textContent = `共 ${state.prompts.length} 条 Prompt，当前显示 ${visibleCount} 条`;
}

function renderCategorySelect() {
  const previousValue = elements.categorySelect.value;
  elements.categorySelect.innerHTML = "";

  for (const category of state.categories) {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    elements.categorySelect.append(option);
  }

  if (state.categories.some((category) => category.id === previousValue)) {
    elements.categorySelect.value = previousValue;
  }
}

function renderCategoryFilters() {
  elements.categoryFilters.innerHTML = "";
  const filters = [{ id: "all", name: "全部" }, ...state.categories];

  for (const category of filters) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = category.id === state.activeCategoryId ? "filter-chip active" : "filter-chip";
    button.textContent = category.name;
    button.addEventListener("click", () => {
      state.activeCategoryId = category.id;
      renderCategoryFilters();
      renderPromptList();
      renderStats();
    });
    elements.categoryFilters.append(button);
  }
}

function getFilteredPrompts() {
  return state.prompts.filter((prompt) => {
    const matchesCategory =
      state.activeCategoryId === "all" || prompt.categoryId === state.activeCategoryId;
    const haystack = `${prompt.title}\n${prompt.content}\n${prompt.categoryName}`.toLowerCase();
    const matchesSearch = !state.search || haystack.includes(state.search);
    return matchesCategory && matchesSearch;
  });
}

function renderPromptList() {
  elements.promptList.innerHTML = "";
  const filteredPrompts = getFilteredPrompts();
  elements.emptyState.classList.toggle("hidden", filteredPrompts.length > 0 || state.prompts.length > 0);

  if (filteredPrompts.length === 0) {
    if (state.prompts.length > 0) {
      const notice = document.createElement("div");
      notice.className = "empty-inline";
      notice.textContent = "没有匹配结果，试试换个关键词或分类。";
      elements.promptList.append(notice);
    }
    return;
  }

  for (const prompt of filteredPrompts) {
    const fragment = elements.promptCardTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".prompt-card");
    const title = fragment.querySelector(".card-title");
    const text = fragment.querySelector(".card-text");
    const category = fragment.querySelector(".card-category");
    const date = fragment.querySelector(".card-date");
    const copyButton = fragment.querySelector(".copy-button");
    const editButton = fragment.querySelector(".edit-button");
    const imageWrap = fragment.querySelector(".card-image-wrap");
    const image = fragment.querySelector(".card-image");

    title.textContent = prompt.title;
    text.textContent = prompt.content;
    category.textContent = prompt.categoryName || "未分类";
    date.textContent = new Date(prompt.updatedAt).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });

    if (prompt.imageBlob) {
      imageWrap.classList.remove("hidden");
      const objectUrl = URL.createObjectURL(prompt.imageBlob);
      image.src = objectUrl;
      image.alt = `${prompt.title} 截图`;
      image.addEventListener(
        "load",
        () => {
          URL.revokeObjectURL(objectUrl);
        },
        { once: true }
      );
    }

    copyButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      await navigator.clipboard.writeText(prompt.content);
      copyButton.textContent = "已复制";
      window.setTimeout(() => {
        copyButton.textContent = "复制";
      }, 1200);
    });

    editButton.addEventListener("click", (event) => {
      event.stopPropagation();
      openPromptDialog(prompt);
    });

    card.dataset.promptId = prompt.id;
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `查看 ${prompt.title}`);
    card.addEventListener("click", () => openDetailDialog(prompt));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDetailDialog(prompt);
      }
    });
    elements.promptList.append(fragment);
  }
}

function renderCategoryManager() {
  elements.categoryList.innerHTML = "";

  for (const category of state.categories) {
    const row = document.createElement("div");
    row.className = "category-row";

    const name = document.createElement("span");
    name.textContent = category.name;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "ghost-button";
    button.textContent = category.id === "default-general" ? "默认分类" : "删除";
    button.disabled = category.id === "default-general";
    button.addEventListener("click", async () => {
      await deleteCategory(category.id);
      if (state.activeCategoryId === category.id) {
        state.activeCategoryId = "all";
      }
      await refreshData();
      render();
    });

    row.append(name, button);
    elements.categoryList.append(row);
  }
}

function openDetailDialog(prompt) {
  state.detailPromptId = prompt.id;
  revokeDetailImageUrl();

  elements.detailCategory.textContent = prompt.categoryName || "未分类";
  elements.detailTitle.textContent = prompt.title;
  elements.detailContent.textContent = prompt.content;
  elements.detailCopyButton.textContent = "复制 Prompt";

  if (prompt.imageBlob) {
    state.detailImageUrl = URL.createObjectURL(prompt.imageBlob);
    elements.detailImage.src = state.detailImageUrl;
    elements.detailImage.alt = `${prompt.title} 截图`;
    elements.detailImageButton.classList.remove("hidden");
  } else {
    elements.detailImage.removeAttribute("src");
    elements.detailImageButton.classList.add("hidden");
  }

  if (!elements.detailDialog.open) {
    elements.detailDialog.showModal();
  }
}

function closeDetailDialog() {
  if (elements.detailDialog.open) {
    elements.detailDialog.close();
  }
}

async function handleDetailCopy() {
  const prompt = state.prompts.find((record) => record.id === state.detailPromptId);
  if (!prompt) {
    return;
  }

  await navigator.clipboard.writeText(prompt.content);
  elements.detailCopyButton.textContent = "已复制";
  window.setTimeout(() => {
    elements.detailCopyButton.textContent = "复制 Prompt";
  }, 1200);
}

function handleDetailEdit() {
  const prompt = state.prompts.find((record) => record.id === state.detailPromptId);
  if (!prompt) {
    return;
  }

  closeDetailDialog();
  openPromptDialog(prompt);
}

function openImageLightbox() {
  const prompt = state.prompts.find((record) => record.id === state.detailPromptId);
  if (!prompt?.imageBlob) {
    return;
  }

  closeImageLightbox();
  state.lightboxImageUrl = URL.createObjectURL(prompt.imageBlob);
  elements.lightboxImage.src = state.lightboxImageUrl;
  elements.lightboxImage.alt = `${prompt.title} 放大截图`;
  elements.imageLightboxDialog.showModal();
}

function closeImageLightbox() {
  if (elements.imageLightboxDialog.open) {
    elements.imageLightboxDialog.close();
  }
}

function revokeDetailImageUrl() {
  if (state.detailImageUrl) {
    URL.revokeObjectURL(state.detailImageUrl);
  }

  state.detailImageUrl = null;
}

function openPromptDialog(prompt) {
  state.editingPromptId = prompt?.id || null;
  state.appliedDraftContent = "";
  state.appliedDraftImageUrl = "";
  state.lastAppliedCaptureMode = "";
  elements.dialogTitle.textContent = prompt ? "编辑 Prompt" : "新增 Prompt";
  elements.promptId.value = prompt?.id || "";
  elements.titleInput.value = prompt?.title || "";
  elements.contentInput.value = prompt?.content || "";
  elements.deleteButton.classList.toggle("hidden", !prompt);

  if (prompt?.categoryId && state.categories.some((category) => category.id === prompt.categoryId)) {
    elements.categorySelect.value = prompt.categoryId;
  } else {
    elements.categorySelect.value = state.categories[0]?.id || "";
  }

  if (prompt?.imageBlob) {
    setStagedImage(prompt.imageBlob);
  } else {
    clearStagedImage();
  }

  if (!elements.editorDialog.open) {
    elements.editorDialog.showModal();
  }
}

function closePromptDialog() {
  elements.editorDialog.close();
  elements.promptForm.reset();
  state.editingPromptId = null;
  state.appliedDraftContent = "";
  state.appliedDraftImageUrl = "";
  state.lastAppliedCaptureMode = "";
  setCaptureStatus("");
  clearStagedImage();
  elements.deleteButton.classList.add("hidden");
}

async function handlePromptSubmit() {
  const selectedCategory = state.categories.find((category) => category.id === elements.categorySelect.value);

  const existingPrompt = state.prompts.find((prompt) => prompt.id === state.editingPromptId);

  await savePrompt({
    id: state.editingPromptId,
    createdAt: existingPrompt?.createdAt,
    title: elements.titleInput.value,
    content: elements.contentInput.value,
    categoryId: selectedCategory?.id || "default-general",
    categoryName: selectedCategory?.name || "默认",
    imageBlob: state.stagedImageBlob || null
  });

  closePromptDialog();
  await refreshData();
  render();
}

async function handleImageSelection(event) {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  await setStagedImageFromFile(file);
}

function handleDragState(event) {
  event.preventDefault();
  elements.imageDropzone.classList.add("dragover");
}

function handleDragLeave(event) {
  event.preventDefault();
  if (event.target === elements.imageDropzone) {
    elements.imageDropzone.classList.remove("dragover");
  }
}

async function handleImageDrop(event) {
  event.preventDefault();
  elements.imageDropzone.classList.remove("dragover");
  const [file] = [...(event.dataTransfer?.files || [])];
  if (!file) {
    return;
  }

  await setStagedImageFromFile(file);
}

async function setStagedImageFromFile(file) {
  if (!file.type.startsWith("image/")) {
    window.alert("请拖入图片文件。");
    return;
  }

  setStagedImage(file);
}

function setStagedImage(blob) {
  if (state.stagedImageUrl) {
    URL.revokeObjectURL(state.stagedImageUrl);
  }

  state.stagedImageBlob = blob;
  state.stagedImageUrl = URL.createObjectURL(blob);
  elements.imagePreview.src = state.stagedImageUrl;
  elements.imagePreviewWrap.classList.remove("hidden");
}

async function blobFromDataUrl(dataUrl) {
  const response = await fetch(dataUrl);
  return response.blob();
}

async function cropScreenshotToBlob(dataUrl, rect, devicePixelRatio = 1) {
  const image = new Image();
  image.src = dataUrl;
  await image.decode();

  const scale = devicePixelRatio || 1;
  const sourceX = Math.max(0, Math.round(rect.x * scale));
  const sourceY = Math.max(0, Math.round(rect.y * scale));
  const sourceWidth = Math.min(image.naturalWidth - sourceX, Math.round(rect.width * scale));
  const sourceHeight = Math.min(image.naturalHeight - sourceY, Math.round(rect.height * scale));

  if (sourceWidth <= 0 || sourceHeight <= 0) {
    return blobFromDataUrl(dataUrl);
  }

  const canvas = document.createElement("canvas");
  canvas.width = sourceWidth;
  canvas.height = sourceHeight;
  const context = canvas.getContext("2d");
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("页面截图裁剪失败"));
      }
    }, "image/png");
  });
}

async function importDraftImage(draft, primaryImageUrl) {
  if (primaryImageUrl) {
    try {
      const response = await fetch(primaryImageUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const blob = await response.blob();
      if (blob.type.startsWith("image/")) {
        return { blob, source: primaryImageUrl };
      }
    } catch (_error) {
      // Use screenshot fallback when direct URL import is blocked.
    }
  }

  if (draft.screenshotDataUrl && draft.screenshotRect) {
    const blob = await cropScreenshotToBlob(
      draft.screenshotDataUrl,
      draft.screenshotRect,
      draft.screenshotDevicePixelRatio || 1
    );
    return { blob, source: "screenshot-fallback" };
  }

  return null;
}

function clearStagedImage() {
  if (state.stagedImageUrl) {
    URL.revokeObjectURL(state.stagedImageUrl);
  }

  state.stagedImageBlob = null;
  state.stagedImageUrl = null;
  elements.imageInput.value = "";
  elements.imagePreview.removeAttribute("src");
  elements.imagePreviewWrap.classList.add("hidden");
}

async function applyPendingSelectionDraft() {
  const result = await chrome.storage.local.get(PENDING_SELECTION_KEY);
  const draft = result[PENDING_SELECTION_KEY];
  const draftHasContent = Boolean(draft?.content);
  const draftImageUrls = draft?.imageUrls || [];
  const primaryImageUrl = draft?.primaryImageUrl || draftImageUrls[0] || "";
  const captureMode = draft?.captureMode || "text-append";
  if (!draftHasContent && draftImageUrls.length === 0 && !draft.screenshotDataUrl) {
    return;
  }

  const signature = JSON.stringify({
    content: draft.content || "",
    imageUrls: draftImageUrls,
    capturedAt: draft.capturedAt || ""
  });

  if (signature === state.pendingDraftSignature) {
    return;
  }
  state.pendingDraftSignature = signature;

  const shouldReuseOpenDialog = elements.editorDialog.open;
  if (!shouldReuseOpenDialog) {
    openPromptDialog();
  }

  const shouldReplaceCurrentDraft = captureMode === "structured-section";

  if (shouldReplaceCurrentDraft) {
    elements.titleInput.value = draft.suggestedTitle || "";
    elements.contentInput.value = draft.content || "";
    state.appliedDraftContent = draft.content?.trim() || "";
    state.appliedDraftImageUrl = "";
  } else if (!elements.titleInput.value.trim()) {
    elements.titleInput.value = draft.suggestedTitle || "";
  }

  if (draftHasContent && !shouldReplaceCurrentDraft) {
    const currentContent = elements.contentInput.value.trim();
    const incomingContent = draft.content.trim();
    const contentToAppend = incomingContent.startsWith(state.appliedDraftContent)
      ? incomingContent.slice(state.appliedDraftContent.length).trim()
      : incomingContent;

    if (!currentContent) {
      elements.contentInput.value = incomingContent;
    } else if (contentToAppend) {
      elements.contentInput.value = [currentContent, contentToAppend].filter(Boolean).join("\n\n");
    }

    state.appliedDraftContent = incomingContent;
  }

  const defaultCategoryId = state.categories[0]?.id || "";
  if (defaultCategoryId && !elements.categorySelect.value) {
    elements.categorySelect.value = defaultCategoryId;
  }

  const imageSourceKey = primaryImageUrl || (draft.screenshotDataUrl && "screenshot-fallback") || "";
  if (imageSourceKey && (shouldReplaceCurrentDraft || imageSourceKey !== state.appliedDraftImageUrl)) {
    try {
      const importedImage = await importDraftImage(draft, primaryImageUrl);
      if (importedImage?.blob) {
        setStagedImage(importedImage.blob);
        state.appliedDraftImageUrl = importedImage.source;
      }
    } catch (error) {
      window.alert(`图片自动导入失败：${error.message}`);
    }
  }

  if (false && draftImageUrls.length > 0) {
    const latestImageUrl = primaryImageUrl;
    if (latestImageUrl && (shouldReplaceCurrentDraft || latestImageUrl !== state.appliedDraftImageUrl)) {
      try {
        const response = await fetch(latestImageUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const blob = await response.blob();
        if (blob.type.startsWith("image/")) {
          setStagedImage(blob);
          state.appliedDraftImageUrl = latestImageUrl;
        }
      } catch (error) {
        window.alert(`截图自动带入失败：${error.message}`);
      }
    }
  }

  if (
    draft.screenshotDataUrl &&
    draft.screenshotRect &&
    state.appliedDraftImageUrl !== "screenshot-fallback" &&
    (!primaryImageUrl || state.appliedDraftImageUrl !== primaryImageUrl)
  ) {
    try {
      const importedImage = await importDraftImage(draft, "");
      if (importedImage?.blob) {
        setStagedImage(importedImage.blob);
        state.appliedDraftImageUrl = importedImage.source;
      }
    } catch (error) {
      window.alert(`截图自动导入失败：${error.message}`);
    }
  }

  setCaptureStatus(buildCaptureStatusText({
    title: draft.suggestedTitle || "",
    content: draft.content || "",
    imageCount: draftImageUrls.length || (draft.screenshotDataUrl ? 1 : 0),
    captureMode
  }));

  state.lastAppliedCaptureMode = captureMode;

  await chrome.storage.local.remove(PENDING_SELECTION_KEY);
  window.setTimeout(() => {
    state.pendingDraftSignature = "";
  }, 0);
}

function buildCaptureStatusText({ title, content, imageCount, captureMode }) {
  const parts = [];
  if (title) {
    parts.push("标题");
  }
  if (content) {
    parts.push("正文");
  }
  if (imageCount > 0) {
    parts.push(`${imageCount} 张图片`);
  }

  if (parts.length === 0) {
    return "";
  }

  const modeText = captureMode === "structured-section" ? "已自动识别" : "已追加";
  const tip = imageCount > 0 ? "" : "。如需截图，可继续右键图片并选择保存为 Prompt";
  return `${modeText}：${parts.join("、")}${tip}`;
}

function setCaptureStatus(message) {
  if (!elements.captureStatus) {
    return;
  }

  elements.captureStatus.textContent = message;
  elements.captureStatus.classList.toggle("hidden", !message);
}

bootstrap().catch((error) => {
  console.error(error);
  elements.promptList.innerHTML = `<div class="error-state">初始化失败：${error.message}</div>`;
});
