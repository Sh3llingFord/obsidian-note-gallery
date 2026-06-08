"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => NoteGalleryPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var VIEW_TYPE = "note-gallery";
var DEFAULT_SETTINGS = {
  thumbnailSize: 72,
  filesFolder: "Files",
  dateLocale: "de-DE",
  sortBy: "modified",
  titleWrap: false
};
function extractFirstImage(content) {
  const wikiMatch = content.match(/!\[\[([^\]]+\.(png|jpg|jpeg|gif|webp))[^\]]*\]\]/i);
  if (wikiMatch) return wikiMatch[1];
  const mdMatch = content.match(/!\[[^\]]*\]\(([^)]+\.(png|jpg|jpeg|gif|webp))[^)]*\)/i);
  if (mdMatch) return decodeURIComponent(mdMatch[1]);
  return null;
}
function extractPreviewText(content) {
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n?/, "");
  const withoutImages = withoutFrontmatter.replace(/!\[\[[^\]]*\]\]/g, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "");
  const plain = withoutImages.replace(/#{1,6}\s/g, "").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/<[^>]+>/g, "").replace(/\n+/g, " ").trim();
  return plain.slice(0, 120) + (plain.length > 120 ? "\u2026" : "");
}
function extractCategories(frontmatter) {
  const cats = frontmatter == null ? void 0 : frontmatter.categories;
  if (Array.isArray(cats) && cats.length > 0) return "#" + cats[0];
  const tags = frontmatter == null ? void 0 : frontmatter.tags;
  if (Array.isArray(tags) && tags.length > 0) return "#" + tags[0];
  return "";
}
function formatDate(frontmatter, file, locale) {
  const raw = (frontmatter == null ? void 0 : frontmatter.date) || (frontmatter == null ? void 0 : frontmatter.created);
  if (raw) {
    const d = new Date(String(raw));
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
  }
  return new Date(file.stat.mtime).toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
var ConfirmDeleteModal = class extends import_obsidian.Modal {
  constructor(app, fileName, onConfirm) {
    super(app);
    this.fileName = fileName;
    this.onConfirm = onConfirm;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: "Notiz l\xF6schen?" });
    contentEl.createEl("p", { text: `"${this.fileName}" wird in den Papierkorb verschoben.` });
    const btnRow = contentEl.createDiv({ cls: "note-gallery-modal-buttons" });
    const cancelBtn = btnRow.createEl("button", { text: "Abbrechen" });
    cancelBtn.addEventListener("click", () => this.close());
    const deleteBtn = btnRow.createEl("button", { text: "L\xF6schen", cls: "mod-warning" });
    deleteBtn.addEventListener("click", () => {
      this.onConfirm();
      this.close();
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};
var NoteGalleryView = class extends import_obsidian.ItemView {
  constructor(leaf, folder, plugin) {
    super(leaf);
    this.folderPath = "";
    this.searchQuery = "";
    this.breadcrumb = [];
    this.folder = folder;
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE;
  }
  getDisplayText() {
    return "Note Gallery";
  }
  getIcon() {
    return "layout-grid";
  }
  getState() {
    var _a, _b;
    return { folderPath: (_b = (_a = this.folder) == null ? void 0 : _a.path) != null ? _b : this.folderPath };
  }
  setState(state, result) {
    return __async(this, null, function* () {
      const path = state == null ? void 0 : state.folderPath;
      if (path) {
        this.folderPath = path;
        const found = this.app.vault.getAbstractFileByPath(path);
        if (found instanceof import_obsidian.TFolder) {
          this.folder = found;
          this.breadcrumb = this.buildBreadcrumb(found);
        }
      }
      this.load();
      yield this.render();
    });
  }
  buildBreadcrumb(folder) {
    var _a;
    const crumbs = [];
    let current = folder;
    while (current) {
      crumbs.unshift(current);
      current = (_a = current.parent) != null ? _a : null;
    }
    return crumbs;
  }
  navigateTo(folder) {
    return __async(this, null, function* () {
      this.folder = folder;
      this.folderPath = folder.path;
      this.breadcrumb = this.buildBreadcrumb(folder);
      this.searchQuery = "";
      yield this.render();
    });
  }
  onOpen() {
    return __async(this, null, function* () {
      this.registerEvent(
        this.app.vault.on("modify", (file) => __async(this, null, function* () {
          var _a, _b;
          if (file instanceof import_obsidian.TFile && ((_a = file.parent) == null ? void 0 : _a.path) === ((_b = this.folder) == null ? void 0 : _b.path)) {
            yield this.render();
          }
        }))
      );
      this.registerEvent(
        this.app.vault.on("create", (file) => __async(this, null, function* () {
          var _a, _b;
          if (file instanceof import_obsidian.TFile && ((_a = file.parent) == null ? void 0 : _a.path) === ((_b = this.folder) == null ? void 0 : _b.path)) {
            yield this.render();
          }
        }))
      );
      this.registerEvent(
        this.app.vault.on("delete", (file) => __async(this, null, function* () {
          var _a, _b;
          if (file instanceof import_obsidian.TFile && ((_a = file.parent) == null ? void 0 : _a.path) === ((_b = this.folder) == null ? void 0 : _b.path)) {
            yield this.render();
          }
        }))
      );
      this.registerEvent(
        this.app.vault.on("rename", (file) => __async(this, null, function* () {
          var _a, _b;
          if (file instanceof import_obsidian.TFile && ((_a = file.parent) == null ? void 0 : _a.path) === ((_b = this.folder) == null ? void 0 : _b.path)) {
            yield this.render();
          }
        }))
      );
      yield this.render();
    });
  }
  render() {
    return __async(this, null, function* () {
      if (!this.folder) return;
      const { thumbnailSize, filesFolder, dateLocale, sortBy, titleWrap } = this.plugin.settings;
      const container = this.containerEl.children[1];
      container.empty();
      container.addClass("note-gallery-container");
      const toolbar = container.createDiv({ cls: "note-gallery-toolbar" });
      const breadcrumbEl = toolbar.createDiv({ cls: "note-gallery-breadcrumb" });
      this.breadcrumb.forEach((crumb, i) => {
        if (i > 0) breadcrumbEl.createSpan({ cls: "note-gallery-breadcrumb-sep", text: " / " });
        const crumbEl = breadcrumbEl.createSpan({ cls: "note-gallery-breadcrumb-item", text: crumb.name || "Vault" });
        if (i < this.breadcrumb.length - 1) {
          crumbEl.addClass("note-gallery-breadcrumb-link");
          crumbEl.addEventListener("click", () => this.navigateTo(crumb));
        }
      });
      const controls = toolbar.createDiv({ cls: "note-gallery-controls" });
      const searchInput = controls.createEl("input", {
        cls: "note-gallery-search",
        type: "text",
        placeholder: "Suchen\u2026"
      });
      searchInput.value = this.searchQuery;
      searchInput.addEventListener("input", () => __async(this, null, function* () {
        this.searchQuery = searchInput.value;
        yield this.renderList(listContainer, filesFolder, dateLocale, sortBy, titleWrap, thumbnailSize);
      }));
      const newBtn = controls.createEl("button", { cls: "note-gallery-new-btn", text: "+" });
      newBtn.title = "Neue Notiz";
      newBtn.addEventListener("click", () => __async(this, null, function* () {
        const name = `Neue Notiz ${(/* @__PURE__ */ new Date()).toLocaleDateString("de-DE")}`;
        const path = this.folder.path + "/" + name + ".md";
        const file = yield this.app.vault.create(path, "");
        yield this.app.workspace.getLeaf(false).openFile(file);
      }));
      const listContainer = container.createDiv({ cls: "note-gallery-list" });
      yield this.renderList(listContainer, filesFolder, dateLocale, sortBy, titleWrap, thumbnailSize);
    });
  }
  renderList(listContainer, filesFolder, dateLocale, sortBy, titleWrap, thumbnailSize) {
    return __async(this, null, function* () {
      var _a, _b;
      listContainer.empty();
      const q = this.searchQuery.toLowerCase();
      const subfolders = this.folder.children.filter((f) => f instanceof import_obsidian.TFolder).filter((f) => !q || f.name.toLowerCase().includes(q)).sort((a, b) => a.name.localeCompare(b.name));
      for (const subfolder of subfolders) {
        const card = listContainer.createDiv({ cls: "note-gallery-card note-gallery-folder-card" });
        const chevron = card.createDiv({ cls: "note-gallery-folder-chevron" });
        chevron.setText("\u203A");
        const textDiv = card.createDiv({ cls: "note-gallery-text" });
        textDiv.createDiv({ cls: "note-gallery-title note-gallery-folder-title", text: subfolder.name });
        const fileCount = subfolder.children.filter((f) => f instanceof import_obsidian.TFile && f.extension === "md").length;
        const folderCount = subfolder.children.filter((f) => f instanceof import_obsidian.TFolder).length;
        const meta = [fileCount + " Notizen", folderCount > 0 ? folderCount + " Unterordner" : ""].filter(Boolean).join(" \xB7 ");
        textDiv.createDiv({ cls: "note-gallery-date", text: meta });
        card.addEventListener("click", () => this.navigateTo(subfolder));
      }
      let files = this.folder.children.filter((f) => f instanceof import_obsidian.TFile && f.extension === "md").filter((f) => !q || f.basename.toLowerCase().includes(q));
      files = files.sort((a, b) => {
        if (sortBy === "name") return a.basename.localeCompare(b.basename);
        if (sortBy === "created") return b.stat.ctime - a.stat.ctime;
        return b.stat.mtime - a.stat.mtime;
      });
      const toolbar = this.containerEl.querySelector(".note-gallery-toolbar");
      const existingCounter = toolbar == null ? void 0 : toolbar.querySelector(".note-gallery-counter");
      if (existingCounter) existingCounter.remove();
      if (toolbar) {
        const counter = toolbar.createDiv({ cls: "note-gallery-counter" });
        counter.setText(files.length + (subfolders.length > 0 ? ` Notizen \xB7 ${subfolders.length} Ordner` : " Notizen"));
      }
      for (const file of files) {
        const content = yield this.app.vault.read(file);
        const cache = this.app.metadataCache.getFileCache(file);
        const frontmatter = (_a = cache == null ? void 0 : cache.frontmatter) != null ? _a : {};
        const imgPath = extractFirstImage(content);
        const previewText = extractPreviewText(content);
        const category = extractCategories(frontmatter);
        const dateStr = formatDate(frontmatter, file, dateLocale);
        const card = listContainer.createDiv({ cls: "note-gallery-card" });
        const textDiv = card.createDiv({ cls: "note-gallery-text" });
        const titleEl = textDiv.createDiv({ cls: "note-gallery-title" });
        titleEl.setText(file.basename);
        if (titleWrap) titleEl.addClass("note-gallery-title--wrap");
        if (category) textDiv.createDiv({ cls: "note-gallery-category", text: category });
        textDiv.createDiv({ cls: "note-gallery-date", text: dateStr });
        if (previewText) {
          const preview = textDiv.createDiv({ cls: "note-gallery-preview", text: previewText });
        }
        if (imgPath) {
          const imgDiv = card.createDiv({ cls: "note-gallery-thumb" });
          imgDiv.style.width = thumbnailSize + "px";
          imgDiv.style.height = thumbnailSize + "px";
          const pathsToTry = [
            imgPath,
            filesFolder + "/" + imgPath.split("/").pop(),
            "Vault/" + imgPath,
            "Vault/" + filesFolder + "/" + imgPath.split("/").pop(),
            ((_b = file.parent) == null ? void 0 : _b.path) + "/" + imgPath
          ].filter(Boolean);
          let imgFile = null;
          for (const p of pathsToTry) {
            const found = this.app.vault.getAbstractFileByPath(p);
            if (found instanceof import_obsidian.TFile) {
              imgFile = found;
              break;
            }
          }
          if (imgFile) {
            const url = this.app.vault.getResourcePath(imgFile);
            const img = imgDiv.createEl("img");
            img.src = url;
            img.alt = file.basename;
          }
        }
        const deleteBtn = card.createDiv({ cls: "note-gallery-delete-btn" });
        deleteBtn.setText("\u2715");
        deleteBtn.title = "L\xF6schen";
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          new ConfirmDeleteModal(this.app, file.basename, () => __async(this, null, function* () {
            yield this.app.vault.trash(file, true);
            new import_obsidian.Notice(`"${file.basename}" gel\xF6scht`);
          })).open();
        });
        card.addEventListener("click", () => {
          this.app.workspace.getLeaf(false).openFile(file);
        });
      }
    });
  }
};
var NoteGallerySettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Note Gallery" });
    new import_obsidian.Setting(containerEl).setName("Thumbnail-Gr\xF6\xDFe").setDesc("Breite und H\xF6he des Vorschaubilds in Pixeln").addSlider(
      (slider) => slider.setLimits(40, 160, 8).setValue(this.plugin.settings.thumbnailSize).setDynamicTooltip().onChange((value) => __async(this, null, function* () {
        this.plugin.settings.thumbnailSize = value;
        yield this.plugin.saveSettings();
      }))
    );
    new import_obsidian.Setting(containerEl).setName("Dateien-Ordner").setDesc("Pfad zum Ordner mit Bilddateien (relativ zum Vault-Root)").addText(
      (text) => text.setPlaceholder("Files").setValue(this.plugin.settings.filesFolder).onChange((value) => __async(this, null, function* () {
        this.plugin.settings.filesFolder = value.trim();
        yield this.plugin.saveSettings();
      }))
    );
    new import_obsidian.Setting(containerEl).setName("Sortierung").setDesc("Nach welchem Kriterium Notizen sortiert werden").addDropdown(
      (drop) => drop.addOption("modified", "\xC4nderungsdatum (neueste zuerst)").addOption("created", "Erstelldatum (neueste zuerst)").addOption("name", "Name (A\u2013Z)").setValue(this.plugin.settings.sortBy).onChange((value) => __async(this, null, function* () {
        this.plugin.settings.sortBy = value;
        yield this.plugin.saveSettings();
      }))
    );
    new import_obsidian.Setting(containerEl).setName("Datumsformat").setDesc("Sprache f\xFCr die Datumsanzeige").addDropdown(
      (drop) => drop.addOption("de-DE", "Deutsch (13. Okt. 2024)").addOption("en-US", "English (Oct 13, 2024)").addOption("en-GB", "English UK (13 Oct 2024)").setValue(this.plugin.settings.dateLocale).onChange((value) => __async(this, null, function* () {
        this.plugin.settings.dateLocale = value;
        yield this.plugin.saveSettings();
      }))
    );
    new import_obsidian.Setting(containerEl).setName("Titel umbrechen").setDesc("Langen Titeln erlauben umzubrechen statt abzuschneiden").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.titleWrap).onChange((value) => __async(this, null, function* () {
        this.plugin.settings.titleWrap = value;
        yield this.plugin.saveSettings();
      }))
    );
  }
};
var NoteGalleryPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
  }
  onload() {
    return __async(this, null, function* () {
      yield this.loadSettings();
      this.registerView(VIEW_TYPE, (leaf) => {
        const root = this.app.vault.getRoot();
        return new NoteGalleryView(leaf, root, this);
      });
      this.addSettingTab(new NoteGallerySettingTab(this.app, this));
      this.registerEvent(
        this.app.workspace.on("file-menu", (menu, file) => {
          if (file instanceof import_obsidian.TFolder) {
            menu.addItem((item) => {
              item.setTitle("Als Galerie \xF6ffnen").setIcon("layout-grid").onClick(() => __async(this, null, function* () {
                const leaf = this.app.workspace.getLeaf(true);
                yield leaf.setViewState({
                  type: VIEW_TYPE,
                  active: true,
                  state: { folderPath: file.path }
                });
              }));
            });
          }
        })
      );
      this.addStyles();
    });
  }
  loadSettings() {
    return __async(this, null, function* () {
      this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
    });
  }
  saveSettings() {
    return __async(this, null, function* () {
      yield this.saveData(this.settings);
    });
  }
  addStyles() {
    const style = document.createElement("style");
    style.id = "note-gallery-styles";
    style.textContent = `
      .note-gallery-container {
        padding: 0;
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .note-gallery-toolbar {
        padding: 10px 12px 6px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        border-bottom: 1px solid var(--background-modifier-border);
        position: sticky;
        top: 0;
        background: var(--background-primary);
        z-index: 10;
      }
      .note-gallery-breadcrumb {
        font-size: 12px;
        color: var(--text-muted);
      }
      .note-gallery-breadcrumb-link {
        color: var(--text-accent);
        cursor: pointer;
      }
      .note-gallery-breadcrumb-link:hover {
        text-decoration: underline;
      }
      .note-gallery-breadcrumb-sep {
        color: var(--text-faint);
      }
      .note-gallery-controls {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .note-gallery-search {
        flex: 1;
        padding: 5px 10px;
        border-radius: 6px;
        border: 1px solid var(--background-modifier-border);
        background: var(--background-secondary);
        color: var(--text-normal);
        font-size: 13px;
      }
      .note-gallery-new-btn {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        border: none;
        background: var(--interactive-accent);
        color: white;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        padding: 0;
      }
      .note-gallery-new-btn:hover {
        background: var(--interactive-accent-hover);
      }
      .note-gallery-counter {
        font-size: 11px;
        color: var(--text-faint);
        padding-bottom: 2px;
      }
      .note-gallery-list {
        overflow-y: auto;
        flex: 1;
        padding: 6px 0;
      }
      .note-gallery-card {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 12px 12px;
        border-bottom: 1px solid var(--background-modifier-border);
        cursor: pointer;
        transition: background 0.15s;
        gap: 12px;
        position: relative;
      }
      .note-gallery-card:hover {
        background: var(--background-modifier-hover);
      }
      .note-gallery-folder-card {
        background: transparent;
      }
      .note-gallery-folder-chevron {
        font-size: 18px;
        color: var(--text-muted);
        width: 16px;
        flex-shrink: 0;
        line-height: 1;
      }
      .note-gallery-folder-title {
        font-weight: 700;
      }
      .note-gallery-text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .note-gallery-title {
        font-size: 15px;
        font-weight: 600;
        color: var(--text-normal);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .note-gallery-title--wrap {
        white-space: normal;
        overflow: visible;
        text-overflow: unset;
      }
      .note-gallery-category {
        font-size: 12px;
        color: var(--text-accent);
      }
      .note-gallery-date {
        font-size: 12px;
        color: var(--text-muted);
      }
      .note-gallery-preview {
        font-size: 12px;
        color: var(--text-faint);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-height: 0;
        opacity: 0;
        transition: max-height 0.2s ease, opacity 0.2s ease;
      }
      .note-gallery-card:hover .note-gallery-preview {
        max-height: 40px;
        opacity: 1;
      }
      .note-gallery-thumb {
        flex-shrink: 0;
        border-radius: 6px;
        overflow: hidden;
        background: var(--background-modifier-border);
      }
      .note-gallery-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .note-gallery-delete-btn {
        position: absolute;
        right: 12px;
        top: 8px;
        font-size: 14px;
        opacity: 0;
        cursor: pointer;
        transition: opacity 0.15s;
        z-index: 2;
        padding: 2px 4px;
        border-radius: 4px;
      }
      .note-gallery-card:hover .note-gallery-delete-btn {
        opacity: 0.5;
      }
      .note-gallery-delete-btn:hover {
        opacity: 1 !important;
        background: var(--background-modifier-error);
      }
      .note-gallery-modal-buttons {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 16px;
      }
    `;
    document.head.appendChild(style);
  }
  onunload() {
    var _a;
    (_a = document.getElementById("note-gallery-styles")) == null ? void 0 : _a.remove();
  }
};
