/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

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

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => EthanUtil
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var UNIQUE_NOTE_TEMPLATE = "Unique Note Inbox Template";
var UNIQUE_NOTE_PATH = "";
var INBOX_PATH = "70-79 \u2611\uFE0F Productivity/70 System/70.01 \u{1F4E5} Inbox";
var TASKS_PATH = "Tasks.md";
var EthanUtil = class extends import_obsidian.Plugin {
  async create_task() {
    const plugin = this.app.plugins.plugins["obsidian-tasks-plugin"];
    const task = await plugin.apiV1.createTaskLineModal();
    const file = this.app.vault.getAbstractFileByPath(TASKS_PATH);
    if (file instanceof import_obsidian.TFile) {
      this.app.vault.append(file, "\n" + task);
    } else {
      console.log("failed to find file for create_task");
    }
  }
  append_task() {
    var _a;
    const editor = (_a = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView)) == null ? void 0 : _a.editor;
    if (editor == null) {
      return;
    }
    const cursor = editor.getCursor();
    const lineContent = editor.getLine(cursor.line);
    editor.replaceRange(
      "",
      { line: cursor.line, ch: 0 },
      { line: cursor.line + 1, ch: 0 }
    );
    const file = this.app.vault.getAbstractFileByPath(TASKS_PATH);
    if (file instanceof import_obsidian.TFile) {
      this.app.vault.append(file, "\n" + lineContent);
    }
  }
  toggle_inbox() {
    let file = this.app.workspace.getActiveFile();
    if (file == null) {
      return;
    }
    this.app.fileManager.processFrontMatter(file, (fm) => {
      let tags = (0, import_obsidian.parseFrontMatterTags)(fm);
      if (tags == null) {
        tags = ["#inbox"];
      } else if (!tags.includes("#inbox")) {
        tags.push("#inbox");
      } else {
        tags = tags.filter((x) => x !== "#inbox");
      }
      fm.tags = tags;
      return fm;
    });
  }
  async copy_markdown() {
    let file = this.app.workspace.getActiveFile();
    if (file == null) {
      return;
    }
    let contents = await this.app.vault.cachedRead(file);
    contents = contents.replace(/^---[\s\S]*?---/, "");
    contents = contents.replace(/^[\s\S]*%%\s*?\-\-\-\s*?%%/, "");
    contents = contents.replace(/\[\[(.*?)\|(.*?)\]\]/g, "$2");
    contents = contents.replace(/\[\[(.*?)\]\]/g, "$1");
    contents = contents.replace(/%%[\s\S]*?%%/g, "");
    contents = contents.replace(/^\s*/, "");
    contents = contents.replace(/\s*$/, "");
    await navigator.clipboard.writeText(contents);
    new import_obsidian.Notice(contents);
  }
  open_inbox_note() {
    const files = this.app.vault.getMarkdownFiles();
    let inboxFiles = [];
    for (const file of files) {
      const mc = this.app.metadataCache.getFileCache(file);
      if (mc == null) {
        continue;
      }
      let tags = (0, import_obsidian.getAllTags)(mc);
      if (tags == null) {
        continue;
      }
      if (tags.includes("#inbox") && file.path.search("Templates") == -1) {
        inboxFiles.push(file);
      }
    }
    let folder = this.app.vault.getAbstractFileByPath(INBOX_PATH);
    if (folder instanceof import_obsidian.TFolder) {
      for (const f of folder.children) {
        if (f instanceof import_obsidian.TFile) {
          inboxFiles.push(f);
        }
      }
    }
    inboxFiles.sort((a, b) => {
      const aIsMarkdown = a.extension === "md";
      const bIsMarkdown = b.extension === "md";
      if (aIsMarkdown && !bIsMarkdown)
        return -1;
      if (!aIsMarkdown && bIsMarkdown)
        return 1;
      return b.stat.ctime - a.stat.ctime;
    });
    if (inboxFiles.length == 0) {
      return;
    }
    let index = 0;
    let activeFile = this.app.workspace.getActiveFile();
    if (activeFile !== null) {
      index = inboxFiles.findIndex((obj) => obj == activeFile);
      if (index < 0) {
        index = -1;
      }
      index = (index + 1) % inboxFiles.length;
    }
    this.app.workspace.getLeaf().openFile(inboxFiles[index]);
  }
  async unique_note() {
    const file = this.app.vault.getMarkdownFiles().find(
      (f) => f.basename == UNIQUE_NOTE_TEMPLATE
    );
    if (file == null) {
      console.log("Can't find: ", UNIQUE_NOTE_TEMPLATE);
      return null;
    }
    let currentDate = new Date().toISOString().slice(0, 10);
    let contents = await this.app.vault.cachedRead(file);
    contents = contents.replace(/{{date}}/g, currentDate);
    let stamp = Math.random().toString(36).substring(9).toUpperCase();
    let name = `${UNIQUE_NOTE_PATH}/${currentDate} ${stamp}.md`;
    let newFile = await this.app.vault.create(name, contents);
    await this.app.workspace.getLeaf().openFile(newFile);
    const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    if (view == null) {
      return;
    }
    view.editor.focus();
  }
  delete_inbox() {
    let file = this.app.workspace.getActiveFile();
    this.open_inbox_note();
    if (file !== null) {
      this.app.vault.trash(file, false);
    }
  }
  async onload() {
    const inbox_next_cb = () => this.open_inbox_note();
    this.addCommand({
      id: "ethan:inbox-next",
      name: "Next inbox",
      callback: inbox_next_cb
    });
    this.addRibbonIcon("mails", "Next Inbox", inbox_next_cb);
    const delete_inbox_cb = () => this.delete_inbox();
    this.addCommand({
      id: "ethan:delete-inbox-next",
      name: "Delete",
      callback: delete_inbox_cb
    });
    this.addRibbonIcon("trash", "Delete", delete_inbox_cb);
    const new_note_cb = () => this.unique_note();
    this.addCommand({
      id: "ethan:unique-note",
      name: "New note",
      callback: new_note_cb
    });
    this.addRibbonIcon("file-plus-2", "Create Unique note", new_note_cb);
    this.addCommand({
      id: "ethan:copy-markdown",
      name: "Copy markdown",
      callback: () => this.copy_markdown()
    });
    this.addCommand({
      id: "ethan:toggle-inbox",
      name: "Toggle inbox",
      callback: () => this.toggle_inbox()
    });
    this.addCommand({
      id: "ethan:append-task",
      name: "Append Task",
      callback: () => this.append_task()
    });
    this.addCommand({
      id: "ethan:create-task",
      name: "Create Task",
      callback: () => this.create_task()
    });
  }
  onunload() {
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgUGx1Z2luLCBBcHAsIE1hcmtkb3duVmlldywgTm90aWNlLCBnZXRBbGxUYWdzLCBwYXJzZUZyb250TWF0dGVyVGFncywgVEZvbGRlciwgVEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5cbmNvbnN0IFVOSVFVRV9OT1RFX1RFTVBMQVRFID0gXCJVbmlxdWUgTm90ZSBJbmJveCBUZW1wbGF0ZVwiO1xuY29uc3QgVU5JUVVFX05PVEVfUEFUSCA9IFwiXCI7XG5jb25zdCBJTkJPWF9QQVRIID0gXCI3MC03OSBcdTI2MTFcdUZFMEYgUHJvZHVjdGl2aXR5LzcwIFN5c3RlbS83MC4wMSBcdUQ4M0RcdURDRTUgSW5ib3hcIjtcbmNvbnN0IFRBU0tTX1BBVEggPSBcIlRhc2tzLm1kXCI7XG5cbi8vZnVuY3Rpb24gb25fY3JlYXRlKGZpbGU6IFRGaWxlLCBhcHA6IEFwcCkge1xuLy9cdGNvbnN0IHRlbXBsYXRlc1BsdWdpbiA9IHRoaXMuYXBwLnBsdWdpbnMucGx1Z2luc1sndGVtcGxhdGVzJ107XG4vL1x0aWYgKCF0ZW1wbGF0ZXNQbHVnaW4gfHwgIXRlbXBsYXRlc1BsdWdpbi5lbmFibGVkKSB7XG4vL1x0XHRjb25zb2xlLmxvZygnVGVtcGxhdGVzIHBsdWdpbiBpcyBub3QgZW5hYmxlZCcpO1xuLy9cdFx0cmV0dXJuO1xuLy9cdH1cbi8vXG4vL1x0Y29uc3QgdGVtcGxhdGVzSW5zdGFuY2UgPSB0ZW1wbGF0ZXNQbHVnaW4uaW5zdGFuY2U7XG4vL1xuLy9cdHRyeSB7XG4vL1x0XHRhd2FpdCB0ZW1wbGF0ZXNJbnN0YW5jZS5pbnNlcnRUZW1wbGF0ZSgnQmFzaWMgVGVtcGxhdGUnKTtcbi8vXHR9IGNhdGNoIChlcnJvcikge1xuLy9cdFx0Y29uc29sZS5lcnJvcignRXJyb3IgaW5zZXJ0aW5nIHRlbXBsYXRlOicsIGVycm9yKTtcbi8vXHR9XG4vL31cbi8vXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdGhhblV0aWwgZXh0ZW5kcyBQbHVnaW4ge1xuXHRhc3luYyBjcmVhdGVfdGFzaygpIHtcblx0XHRjb25zdCBwbHVnaW4gPSB0aGlzLmFwcC5wbHVnaW5zLnBsdWdpbnNbJ29ic2lkaWFuLXRhc2tzLXBsdWdpbiddXG5cdFx0Y29uc3QgdGFzayA9IGF3YWl0IHBsdWdpbi5hcGlWMS5jcmVhdGVUYXNrTGluZU1vZGFsKCk7XG5cdFx0Y29uc3QgZmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChUQVNLU19QQVRIKTtcblxuXHRcdGlmIChmaWxlIGluc3RhbmNlb2YgVEZpbGUpIHtcblx0XHRcdHRoaXMuYXBwLnZhdWx0LmFwcGVuZChmaWxlLCBcIlxcblwiICsgdGFzayk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUubG9nKFwiZmFpbGVkIHRvIGZpbmQgZmlsZSBmb3IgY3JlYXRlX3Rhc2tcIilcblx0XHR9XG5cdH1cblxuXHRhcHBlbmRfdGFzaygpIHtcblx0XHRjb25zdCBlZGl0b3IgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpPy5lZGl0b3I7XG5cdFx0aWYgKGVkaXRvciA9PSBudWxsKSB7XG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cblx0XHRjb25zdCBjdXJzb3IgPSBlZGl0b3IuZ2V0Q3Vyc29yKCk7XG5cdFx0Y29uc3QgbGluZUNvbnRlbnQgPSBlZGl0b3IuZ2V0TGluZShjdXJzb3IubGluZSk7XG5cblx0XHRlZGl0b3IucmVwbGFjZVJhbmdlKFwiXCIsXG5cdFx0XHR7IGxpbmU6IGN1cnNvci5saW5lLCBjaDogMCB9LFxuXHRcdFx0eyBsaW5lOiBjdXJzb3IubGluZSArIDEsIGNoOiAwIH0pO1xuXG5cdFx0Y29uc3QgZmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChUQVNLU19QQVRIKTtcblx0XHRpZiAoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG5cdFx0XHR0aGlzLmFwcC52YXVsdC5hcHBlbmQoZmlsZSwgXCJcXG5cIiArIGxpbmVDb250ZW50KTtcblx0XHR9XG5cdH1cblxuXHR0b2dnbGVfaW5ib3goKSB7XG5cdFx0bGV0IGZpbGUgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xuXHRcdGlmIChmaWxlID09IG51bGwpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLmFwcC5maWxlTWFuYWdlci5wcm9jZXNzRnJvbnRNYXR0ZXIoZmlsZSwgKGZtOiBhbnkpID0+IHtcblx0XHRcdGxldCB0YWdzID0gcGFyc2VGcm9udE1hdHRlclRhZ3MoZm0pO1xuXG5cdFx0XHRpZiAodGFncyA9PSBudWxsKSB7XG5cdFx0XHRcdHRhZ3MgPSBbXCIjaW5ib3hcIl07XG5cdFx0XHR9IGVsc2UgaWYgKCF0YWdzLmluY2x1ZGVzKFwiI2luYm94XCIpKSB7XG5cdFx0XHRcdHRhZ3MucHVzaChcIiNpbmJveFwiKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRhZ3MgPSB0YWdzLmZpbHRlcigoeDogc3RyaW5nKSA9PiB4ICE9PSBcIiNpbmJveFwiKTtcblx0XHRcdH1cblx0XHRcdGZtLnRhZ3MgPSB0YWdzO1xuXHRcdFx0cmV0dXJuIGZtO1xuXHRcdH0pO1xuXHR9XG5cblx0YXN5bmMgY29weV9tYXJrZG93bigpIHtcblx0XHRsZXQgZmlsZSA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XG5cdFx0aWYgKGZpbGUgPT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxldCBjb250ZW50cyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNhY2hlZFJlYWQoZmlsZSk7XG5cdFx0Y29udGVudHMgPSBjb250ZW50cy5yZXBsYWNlKC9eLS0tW1xcc1xcU10qPy0tLS8sIFwiXCIpO1xuXHRcdGNvbnRlbnRzID0gY29udGVudHMucmVwbGFjZSgvXltcXHNcXFNdKiUlXFxzKj9cXC1cXC1cXC1cXHMqPyUlLywgXCJcIik7XG5cdFx0Y29udGVudHMgPSBjb250ZW50cy5yZXBsYWNlKC9cXFtcXFsoLio/KVxcfCguKj8pXFxdXFxdL2csIFwiJDJcIik7XG5cdFx0Y29udGVudHMgPSBjb250ZW50cy5yZXBsYWNlKC9cXFtcXFsoLio/KVxcXVxcXS9nLCBcIiQxXCIpO1xuXHRcdGNvbnRlbnRzID0gY29udGVudHMucmVwbGFjZSgvJSVbXFxzXFxTXSo/JSUvZywgXCJcIik7XG5cdFx0Y29udGVudHMgPSBjb250ZW50cy5yZXBsYWNlKC9eXFxzKi8sIFwiXCIpO1xuXHRcdGNvbnRlbnRzID0gY29udGVudHMucmVwbGFjZSgvXFxzKiQvLCBcIlwiKTtcblxuXHRcdGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGNvbnRlbnRzKTtcblx0XHRuZXcgTm90aWNlKGNvbnRlbnRzKTtcblx0fVxuXG5cdG9wZW5faW5ib3hfbm90ZSgpIHtcblx0XHRjb25zdCBmaWxlcyA9IHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcblxuXHRcdGxldCBpbmJveEZpbGVzID0gW107XG5cdFx0Zm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG5cdFx0XHRjb25zdCBtYyA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKGZpbGUpO1xuXHRcdFx0aWYgKG1jID09IG51bGwpIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGxldCB0YWdzID0gZ2V0QWxsVGFncyhtYyk7XG5cdFx0XHRpZiAodGFncyA9PSBudWxsKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGFncy5pbmNsdWRlcyhcIiNpbmJveFwiKVxuXHRcdFx0XHQmJiBmaWxlLnBhdGguc2VhcmNoKFwiVGVtcGxhdGVzXCIpID09IC0xKSB7XG5cdFx0XHRcdGluYm94RmlsZXMucHVzaChmaWxlKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRsZXQgZm9sZGVyID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKElOQk9YX1BBVEgpO1xuXHRcdGlmIChmb2xkZXIgaW5zdGFuY2VvZiBURm9sZGVyKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGYgb2YgZm9sZGVyLmNoaWxkcmVuKSB7XG5cdFx0XHRcdGlmIChmIGluc3RhbmNlb2YgVEZpbGUpIHtcblx0XHRcdFx0XHRpbmJveEZpbGVzLnB1c2goZik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRpbmJveEZpbGVzLnNvcnQoKGEsIGIpID0+IHtcblx0XHRcdC8vIENoZWNrIGlmIGZpbGVzIGFyZSBtYXJrZG93blxuXHRcdFx0Y29uc3QgYUlzTWFya2Rvd24gPSBhLmV4dGVuc2lvbiA9PT0gJ21kJztcblx0XHRcdGNvbnN0IGJJc01hcmtkb3duID0gYi5leHRlbnNpb24gPT09ICdtZCc7XG5cblx0XHRcdC8vIElmIG9uZSBpcyBtYXJrZG93biBhbmQgdGhlIG90aGVyIGlzbid0LCBwcmlvcml0aXplIG1hcmtkb3duXG5cdFx0XHRpZiAoYUlzTWFya2Rvd24gJiYgIWJJc01hcmtkb3duKSByZXR1cm4gLTE7XG5cdFx0XHRpZiAoIWFJc01hcmtkb3duICYmIGJJc01hcmtkb3duKSByZXR1cm4gMTtcblxuXHRcdFx0Ly8gSWYgYm90aCBhcmUgbWFya2Rvd24gb3IgYm90aCBhcmUgbm90LCBzb3J0IGJ5IGNyZWF0aW9uIHRpbWVcblx0XHRcdHJldHVybiBiLnN0YXQuY3RpbWUgLSBhLnN0YXQuY3RpbWU7XG5cdFx0fSk7XG5cblx0XHRpZiAoaW5ib3hGaWxlcy5sZW5ndGggPT0gMCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxldCBpbmRleCA9IDA7XG5cdFx0bGV0IGFjdGl2ZUZpbGUgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xuXHRcdGlmIChhY3RpdmVGaWxlICE9PSBudWxsKSB7XG5cdFx0XHRpbmRleCA9IGluYm94RmlsZXMuZmluZEluZGV4KG9iaiA9PiBvYmogPT0gYWN0aXZlRmlsZSk7IC8vIFdlIHdhbnQgdGhlIG5leHQgZmlsZS5cblx0XHRcdGlmIChpbmRleCA8IDApIHtcblx0XHRcdFx0aW5kZXggPSAtMTtcblx0XHRcdH1cblx0XHRcdGluZGV4ID0gKGluZGV4ICsgMSkgJSBpbmJveEZpbGVzLmxlbmd0aDtcblx0XHR9XG5cblx0XHR0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhZigpLm9wZW5GaWxlKGluYm94RmlsZXNbaW5kZXhdKTtcblx0fVxuXG5cdGFzeW5jIHVuaXF1ZV9ub3RlKCkge1xuXHRcdGNvbnN0IGZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCkuZmluZChcblx0XHRcdGYgPT4gZi5iYXNlbmFtZSA9PSBVTklRVUVfTk9URV9URU1QTEFURSk7XG5cblx0XHRpZiAoZmlsZSA9PSBudWxsKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcIkNhbid0IGZpbmQ6IFwiLCBVTklRVUVfTk9URV9URU1QTEFURSk7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRsZXQgY3VycmVudERhdGUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc2xpY2UoMCwgMTApO1xuXHRcdGxldCBjb250ZW50cyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNhY2hlZFJlYWQoZmlsZSk7XG5cdFx0Y29udGVudHMgPSBjb250ZW50cy5yZXBsYWNlKC97e2RhdGV9fS9nLCBjdXJyZW50RGF0ZSk7XG5cblx0XHRsZXQgc3RhbXAgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoOSkudG9VcHBlckNhc2UoKTtcblx0XHRsZXQgbmFtZSA9IGAke1VOSVFVRV9OT1RFX1BBVEh9LyR7Y3VycmVudERhdGV9ICR7c3RhbXB9Lm1kYDtcblx0XHRsZXQgbmV3RmlsZSA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNyZWF0ZShuYW1lLCBjb250ZW50cyk7XG5cdFx0YXdhaXQgdGhpcy5hcHAud29ya3NwYWNlLmdldExlYWYoKS5vcGVuRmlsZShuZXdGaWxlKTtcblxuXHRcdGNvbnN0IHZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xuXHRcdGlmICh2aWV3ID09IG51bGwpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblx0XHR2aWV3LmVkaXRvci5mb2N1cygpO1xuXHR9XG5cblx0ZGVsZXRlX2luYm94KCkge1xuXHRcdGxldCBmaWxlID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcblx0XHR0aGlzLm9wZW5faW5ib3hfbm90ZSgpO1xuXHRcdGlmIChmaWxlICE9PSBudWxsKSB7XG5cdFx0XHR0aGlzLmFwcC52YXVsdC50cmFzaChmaWxlLCBmYWxzZSk7XG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgb25sb2FkKCkge1xuXHRcdGNvbnN0IGluYm94X25leHRfY2IgPSAoKSA9PiB0aGlzLm9wZW5faW5ib3hfbm90ZSgpXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdGlkOiAnZXRoYW46aW5ib3gtbmV4dCcsXG5cdFx0XHRuYW1lOiAnTmV4dCBpbmJveCcsXG5cdFx0XHRjYWxsYmFjazogaW5ib3hfbmV4dF9jYixcblx0XHR9KTtcblx0XHR0aGlzLmFkZFJpYmJvbkljb24oXCJtYWlsc1wiLCBcIk5leHQgSW5ib3hcIiwgaW5ib3hfbmV4dF9jYik7XG5cblx0XHRjb25zdCBkZWxldGVfaW5ib3hfY2IgPSAoKSA9PiB0aGlzLmRlbGV0ZV9pbmJveCgpXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdGlkOiAnZXRoYW46ZGVsZXRlLWluYm94LW5leHQnLFxuXHRcdFx0bmFtZTogJ0RlbGV0ZScsXG5cdFx0XHRjYWxsYmFjazogZGVsZXRlX2luYm94X2NiLFxuXHRcdH0pO1xuXHRcdHRoaXMuYWRkUmliYm9uSWNvbihcInRyYXNoXCIsIFwiRGVsZXRlXCIsIGRlbGV0ZV9pbmJveF9jYik7XG5cblx0XHRjb25zdCBuZXdfbm90ZV9jYiA9ICgpID0+IHRoaXMudW5pcXVlX25vdGUoKVxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogJ2V0aGFuOnVuaXF1ZS1ub3RlJyxcblx0XHRcdG5hbWU6ICdOZXcgbm90ZScsXG5cdFx0XHRjYWxsYmFjazogbmV3X25vdGVfY2IsXG5cdFx0fSk7XG5cdFx0dGhpcy5hZGRSaWJib25JY29uKFwiZmlsZS1wbHVzLTJcIiwgXCJDcmVhdGUgVW5pcXVlIG5vdGVcIiwgbmV3X25vdGVfY2IpO1xuXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdGlkOiAnZXRoYW46Y29weS1tYXJrZG93bicsXG5cdFx0XHRuYW1lOiAnQ29weSBtYXJrZG93bicsXG5cdFx0XHRjYWxsYmFjazogKCkgPT4gdGhpcy5jb3B5X21hcmtkb3duKClcblx0XHR9KTtcblx0XHQvLyBUT0RPIGFkZCBhIHJpYmJvbiBpY29uIGZvciBjb3B5IG1hcmtkb3duXG5cblx0XHR0aGlzLmFkZENvbW1hbmQoe1xuXHRcdFx0aWQ6ICdldGhhbjp0b2dnbGUtaW5ib3gnLFxuXHRcdFx0bmFtZTogJ1RvZ2dsZSBpbmJveCcsXG5cdFx0XHRjYWxsYmFjazogKCkgPT4gdGhpcy50b2dnbGVfaW5ib3goKVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdGlkOiAnZXRoYW46YXBwZW5kLXRhc2snLFxuXHRcdFx0bmFtZTogJ0FwcGVuZCBUYXNrJyxcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB0aGlzLmFwcGVuZF90YXNrKClcblx0XHR9KTtcblxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogJ2V0aGFuOmNyZWF0ZS10YXNrJyxcblx0XHRcdG5hbWU6ICdDcmVhdGUgVGFzaycsXG5cdFx0XHRjYWxsYmFjazogKCkgPT4gdGhpcy5jcmVhdGVfdGFzaygpXG5cdFx0fSk7XG5cblxuXHRcdC8vdGhpcy5hcHAud29ya3NwYWNlLm9uTGF5b3V0UmVhZHkoKCkgPT4ge1xuXHRcdC8vXHR0aGlzLnJlZ2lzdGVyRXZlbnQodGhpcy5hcHAudmF1bHQub24oJ2NyZWF0ZScsIHRoaXMub25DcmVhdGUsIHRoaXMpKTtcblx0XHQvL30pO1xuXG5cdH1cblxuXHRvbnVubG9hZCgpIHsgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHNCQUFvRztBQUVwRyxJQUFNLHVCQUF1QjtBQUM3QixJQUFNLG1CQUFtQjtBQUN6QixJQUFNLGFBQWE7QUFDbkIsSUFBTSxhQUFhO0FBa0JuQixJQUFxQixZQUFyQixjQUF1Qyx1QkFBTztBQUFBLEVBQzdDLE1BQU0sY0FBYztBQUNuQixVQUFNLFNBQVMsS0FBSyxJQUFJLFFBQVEsUUFBUSx1QkFBdUI7QUFDL0QsVUFBTSxPQUFPLE1BQU0sT0FBTyxNQUFNLG9CQUFvQjtBQUNwRCxVQUFNLE9BQU8sS0FBSyxJQUFJLE1BQU0sc0JBQXNCLFVBQVU7QUFFNUQsUUFBSSxnQkFBZ0IsdUJBQU87QUFDMUIsV0FBSyxJQUFJLE1BQU0sT0FBTyxNQUFNLE9BQU8sSUFBSTtBQUFBLElBQ3hDLE9BQU87QUFDTixjQUFRLElBQUkscUNBQXFDO0FBQUEsSUFDbEQ7QUFBQSxFQUNEO0FBQUEsRUFFQSxjQUFjO0FBcENmO0FBcUNFLFVBQU0sVUFBUyxVQUFLLElBQUksVUFBVSxvQkFBb0IsNEJBQVksTUFBbkQsbUJBQXNEO0FBQ3JFLFFBQUksVUFBVSxNQUFNO0FBQ25CO0FBQUEsSUFDRDtBQUVBLFVBQU0sU0FBUyxPQUFPLFVBQVU7QUFDaEMsVUFBTSxjQUFjLE9BQU8sUUFBUSxPQUFPLElBQUk7QUFFOUMsV0FBTztBQUFBLE1BQWE7QUFBQSxNQUNuQixFQUFFLE1BQU0sT0FBTyxNQUFNLElBQUksRUFBRTtBQUFBLE1BQzNCLEVBQUUsTUFBTSxPQUFPLE9BQU8sR0FBRyxJQUFJLEVBQUU7QUFBQSxJQUFDO0FBRWpDLFVBQU0sT0FBTyxLQUFLLElBQUksTUFBTSxzQkFBc0IsVUFBVTtBQUM1RCxRQUFJLGdCQUFnQix1QkFB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
