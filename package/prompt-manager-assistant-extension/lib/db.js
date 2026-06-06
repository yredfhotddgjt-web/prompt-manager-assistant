const DB_NAME = "zero-get-prompts";
const DB_VERSION = 1;
const PROMPTS_STORE = "prompts";
const CATEGORIES_STORE = "categories";

function promisifyRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withTransaction(mode, callback) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction([PROMPTS_STORE, CATEGORIES_STORE], mode);
        const result = callback({
          prompts: transaction.objectStore(PROMPTS_STORE),
          categories: transaction.objectStore(CATEGORIES_STORE),
          transaction
        });

        transaction.oncomplete = async () => {
          try {
            resolve(await result);
          } catch (error) {
            reject(error);
          }
        };

        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      })
  );
}

let dbPromise;

export function openDb() {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(PROMPTS_STORE)) {
        const prompts = db.createObjectStore(PROMPTS_STORE, { keyPath: "id" });
        prompts.createIndex("updatedAt", "updatedAt");
        prompts.createIndex("categoryId", "categoryId");
      }

      if (!db.objectStoreNames.contains(CATEGORIES_STORE)) {
        const categories = db.createObjectStore(CATEGORIES_STORE, { keyPath: "id" });
        categories.createIndex("name", "name", { unique: true });
        categories.add({
          id: "default-general",
          name: "默认"
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

export async function getCategories() {
  return withTransaction("readonly", ({ categories }) => promisifyRequest(categories.getAll()));
}

export async function createCategory(name) {
  const cleanName = name.trim();
  if (!cleanName) {
    throw new Error("分类名称不能为空");
  }

  const existing = await getCategories();
  if (existing.some((category) => category.name === cleanName)) {
    throw new Error("分类已存在");
  }

  return withTransaction("readwrite", ({ categories }) => {
    const record = {
      id: crypto.randomUUID(),
      name: cleanName
    };
    categories.add(record);
    return record;
  });
}

export async function deleteCategory(categoryId) {
  const fallbackId = "default-general";
  if (categoryId === fallbackId) {
    return;
  }

  const promptRecords = await getPrompts();
  const fallbackCategory = (await getCategories()).find((category) => category.id === fallbackId);

  return withTransaction("readwrite", ({ categories, prompts }) => {
    for (const prompt of promptRecords) {
      if (prompt.categoryId === categoryId) {
        prompts.put({
          ...prompt,
          categoryId: fallbackId,
          categoryName: fallbackCategory?.name || "默认",
          updatedAt: new Date().toISOString()
        });
      }
    }

    categories.delete(categoryId);
  });
}

export async function getPrompts() {
  const records = await withTransaction("readonly", ({ prompts }) => promisifyRequest(prompts.getAll()));
  return records.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function savePrompt(promptInput) {
  if (!promptInput.title.trim()) {
    throw new Error("标题不能为空");
  }

  if (!promptInput.content.trim()) {
    throw new Error("Prompt 内容不能为空");
  }

  const now = new Date().toISOString();
  const record = {
    id: promptInput.id || crypto.randomUUID(),
    title: promptInput.title.trim(),
    content: promptInput.content.trim(),
    categoryId: promptInput.categoryId,
    categoryName: promptInput.categoryName,
    imageBlob: promptInput.imageBlob || null,
    imageType: promptInput.imageBlob?.type || null,
    createdAt: promptInput.createdAt || now,
    updatedAt: now
  };

  await withTransaction("readwrite", ({ prompts }) => {
    prompts.put(record);
  });

  return record;
}

export async function deletePrompt(promptId) {
  return withTransaction("readwrite", ({ prompts }) => {
    prompts.delete(promptId);
  });
}
