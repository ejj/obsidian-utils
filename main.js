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
var BASIC_TEMPLATE = "Basic Template";
var INBOX_PATH = "Inbox";
var TASKS_PATH = "Tasks.md";
var index = 0;
function currentDate() {
  return new Date().toISOString().slice(0, 10);
}
function getFilesRecursive(folder) {
  let files = [];
  folder.children.forEach((child) => {
    if (child instanceof import_obsidian.TFile) {
      files.push(child);
    } else if (child instanceof import_obsidian.TFolder) {
      files = files.concat(getFilesRecursive(child));
    }
  });
  return files;
}
var EthanUtil = class extends import_obsidian.Plugin {
  async unique_note_contents() {
    const file = this.app.vault.getMarkdownFiles().find(
      (f) => f.basename == BASIC_TEMPLATE
    );
    if (file == null) {
      throw new Error("Can't find: " + BASIC_TEMPLATE);
    }
    let contents = await this.app.vault.cachedRead(file);
    contents = contents.replace(/{{date}}/g, currentDate());
    return contents;
  }
  async on_create(file) {
    if (file.extension !== "md") {
      return;
    }
    const new_contents = await this.unique_note_contents();
    await new Promise((resolve) => setTimeout(resolve, 10));
    const old_content = await this.app.vault.read(file);
    if (/^---/.test(old_content)) {
      return;
    }
    this.app.vault.modify(file, new_contents + old_content);
  }
  async create_task() {
    const plugin = this.app.plugins.plugins["obsidian-tasks-plugin"];
    const file = this.app.vault.getAbstractFileByPath(TASKS_PATH);
    if (!(file instanceof import_obsidian.TFile)) {
      console.log("failed to find file for create_task");
      return;
    }
    const task = await plugin.apiV1.createTaskLineModal();
    const content = await this.app.vault.read(file);
    await this.app.vault.modify(file, content + "\n" + task);
  }
  async append_task() {
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
      await this.app.vault.append(file, "\n" + lineContent);
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
      inboxFiles = inboxFiles.concat(getFilesRecursive(folder));
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
    let activeFile = this.app.workspace.getActiveFile();
    if (activeFile !== null) {
      let activeFileIndex = inboxFiles.findIndex((obj) => obj == activeFile);
      if (activeFileIndex >= 0) {
        index = activeFileIndex + 1;
      }
    }
    index %= inboxFiles.length;
    this.app.workspace.getLeaf().openFile(inboxFiles[index]);
  }
  async unique_note() {
    const file = this.app.vault.getMarkdownFiles().find(
      (f) => f.basename == BASIC_TEMPLATE
    );
    if (file == null) {
      console.log("Can't find: ", BASIC_TEMPLATE);
      return null;
    }
    let stamp = Math.random().toString(36).substring(9).toUpperCase();
    let name = `${currentDate()} ${stamp}.md`;
    let contents = await this.unique_note_contents();
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
    this.addRibbonIcon("mails", "Next", inbox_next_cb);
    const new_note_cb = () => this.unique_note();
    this.addCommand({
      id: "ethan:unique-note",
      name: "New note",
      callback: new_note_cb
    });
    this.addRibbonIcon("file-plus-2", "Create", new_note_cb);
    const delete_inbox_cb = () => this.delete_inbox();
    this.addCommand({
      id: "ethan:delete-inbox-next",
      name: "Delete",
      callback: delete_inbox_cb
    });
    this.addRibbonIcon("trash", "Delete", delete_inbox_cb);
    const copy_markdown_cb = () => this.copy_markdown();
    this.addCommand({
      id: "ethan:copy-markdown",
      name: "Copy markdown",
      callback: copy_markdown_cb
    });
    this.addRibbonIcon("clipboard-copy", "Copy", copy_markdown_cb);
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
    this.app.workspace.onLayoutReady(() => {
      this.registerEvent(this.app.vault.on("create", this.on_create, this));
    });
  }
  onunload() {
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgUGx1Z2luLCBBcHAsIE1hcmtkb3duVmlldywgTm90aWNlLCBnZXRBbGxUYWdzLCBwYXJzZUZyb250TWF0dGVyVGFncywgVEZvbGRlciwgVEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5cbmNvbnN0IEJBU0lDX1RFTVBMQVRFID0gXCJCYXNpYyBUZW1wbGF0ZVwiO1xuY29uc3QgSU5CT1hfUEFUSCA9IFwiSW5ib3hcIjtcbmNvbnN0IFRBU0tTX1BBVEggPSBcIlRhc2tzLm1kXCI7XG5cbnZhciBpbmRleCA9IDA7XG5cbmZ1bmN0aW9uIGN1cnJlbnREYXRlKCkge1xuXHRyZXR1cm4gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNsaWNlKDAsIDEwKTtcbn1cblxuZnVuY3Rpb24gZ2V0RmlsZXNSZWN1cnNpdmUoZm9sZGVyOiBURm9sZGVyKTogVEZpbGVbXSB7XG5cdGxldCBmaWxlczogVEZpbGVbXSA9IFtdO1xuXG5cdC8vIEdldCBhbGwgY2hpbGRyZW4gKGZpbGVzIGFuZCBmb2xkZXJzKSBpbiB0aGUgY3VycmVudCBmb2xkZXJcblx0Zm9sZGVyLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG5cdFx0aWYgKGNoaWxkIGluc3RhbmNlb2YgVEZpbGUpIHtcblx0XHRcdC8vIElmIGl0J3MgYSBmaWxlLCBhZGQgaXQgdG8gdGhlIGxpc3Rcblx0XHRcdGZpbGVzLnB1c2goY2hpbGQpO1xuXHRcdH0gZWxzZSBpZiAoY2hpbGQgaW5zdGFuY2VvZiBURm9sZGVyKSB7XG5cdFx0XHQvLyBJZiBpdCdzIGEgZm9sZGVyLCByZWN1cnNpdmVseSBnZXQgaXRzIGZpbGVzIGFuZCBhZGQgdGhlbSB0byB0aGUgbGlzdFxuXHRcdFx0ZmlsZXMgPSBmaWxlcy5jb25jYXQoZ2V0RmlsZXNSZWN1cnNpdmUoY2hpbGQpKTtcblx0XHR9XG5cdH0pO1xuXG5cdHJldHVybiBmaWxlcztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXRoYW5VdGlsIGV4dGVuZHMgUGx1Z2luIHtcblx0YXN5bmMgdW5pcXVlX25vdGVfY29udGVudHMoKSB7XG5cdFx0Y29uc3QgZmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKS5maW5kKFxuXHRcdFx0ZiA9PiBmLmJhc2VuYW1lID09IEJBU0lDX1RFTVBMQVRFKTtcblxuXHRcdGlmIChmaWxlID09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkNhbid0IGZpbmQ6IFwiICsgQkFTSUNfVEVNUExBVEUpO1xuXHRcdH1cblxuXHRcdGxldCBjb250ZW50cyA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNhY2hlZFJlYWQoZmlsZSk7XG5cdFx0Y29udGVudHMgPSBjb250ZW50cy5yZXBsYWNlKC97e2RhdGV9fS9nLCBjdXJyZW50RGF0ZSgpKTtcblxuXHRcdHJldHVybiBjb250ZW50c1xuXHR9XG5cblx0YXN5bmMgb25fY3JlYXRlKGZpbGU6IFRGaWxlKSB7XG5cdFx0aWYgKGZpbGUuZXh0ZW5zaW9uICE9PSAnbWQnKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc3QgbmV3X2NvbnRlbnRzID0gYXdhaXQgdGhpcy51bmlxdWVfbm90ZV9jb250ZW50cygpO1xuXG5cdFx0Ly8gVGhpcyBpcyBhIGJpdCBvZiBhIGhhY2sgdG8gcmVzb2x2ZSBhbiBpc3N1ZSBvbiBtb2JpbGUuICBXaGVuIHlvdVxuXHRcdC8vIHNoYXJlIHRvIG9ic2lkaWFuIGFuZCBjcmVhdGUgYSBuZXcgZmlsZSwgb2JzaWRpYW4gd2lsbCBjcmVhdGUgdGhlIGZpbGVcblx0XHQvLyBhbmQgdGhlbiB1c2UgbW9kaWZ5IHRvIHJlcGxhY2UgaXRzIGNvbnRlbnRzLiAgSWYgd2UgcnVuXG5cdFx0Ly8gY29uY3VycmVudGx5LCB3ZSBjb3VsZCByZWFkIHRoZSBlbXB0eSBjb250ZW50cyBvZiB0aGUgZmlsZSwgYW5kIHRoZW5cblx0XHQvLyBvdmVyd3JpdGUgd2hhdGV2ZXIgdGhleSBkaWQuICAgVG8gcmVzb2x2ZSB0aGlzLCB3ZSByZWFkIG91ciB0ZW1wbGF0ZSxcblx0XHQvLyBhbmQgdGhlbiBzbGVlcCBmb3IgMTBtcy4gIFRoYXQgZ2l2ZXMganVzdCBlbm91Z2ggYnVmZmVyIHRvIGVuc3VyZSB0aGF0XG5cdFx0Ly8gd2UncmUgbm90IGNsb2JiZXJpbmcgdGhlIHNoYXJlLlxuXHRcdGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCAxMCkpO1xuXG5cdFx0Y29uc3Qgb2xkX2NvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuXG5cdFx0Ly8gSWYgaXQgc3RhcnRzIHdpdGggZnJvbnRtYXR0ZXIsIGRvbid0IGFkZCBvdXIgdGVtcGxhdGVcblx0XHRpZiAoL14tLS0vLnRlc3Qob2xkX2NvbnRlbnQpKSB7XG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cblx0XHR0aGlzLmFwcC52YXVsdC5tb2RpZnkoZmlsZSwgbmV3X2NvbnRlbnRzICsgb2xkX2NvbnRlbnQpXG5cdH1cblxuXHRhc3luYyBjcmVhdGVfdGFzaygpIHtcblx0XHRjb25zdCBwbHVnaW4gPSB0aGlzLmFwcC5wbHVnaW5zLnBsdWdpbnNbJ29ic2lkaWFuLXRhc2tzLXBsdWdpbiddXG5cdFx0Y29uc3QgZmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChUQVNLU19QQVRIKTtcblxuXHRcdGlmICghKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkpIHtcblx0XHRcdGNvbnNvbGUubG9nKFwiZmFpbGVkIHRvIGZpbmQgZmlsZSBmb3IgY3JlYXRlX3Rhc2tcIilcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBPbiB0aGUgYm9veCBqdXN0IGRvaW5nIGFuIGFwcGVuZCBjYW4gY29ycnVwdCB0aGUgZmlsZS4gICBQdWxsaW5nIGluXG5cdFx0Ly8gdGhlIGNvbnRlbnQgZXhwbGljaXRseSBzZWVtcyB0byB3b3JrLlxuXHRcdGNvbnN0IHRhc2sgPSBhd2FpdCBwbHVnaW4uYXBpVjEuY3JlYXRlVGFza0xpbmVNb2RhbCgpO1xuXHRcdGNvbnN0IGNvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuXHRcdGF3YWl0IHRoaXMuYXBwLnZhdWx0Lm1vZGlmeShmaWxlLCBjb250ZW50ICsgXCJcXG5cIiArIHRhc2spO1xuXHR9XG5cblx0YXN5bmMgYXBwZW5kX3Rhc2soKSB7XG5cdFx0Y29uc3QgZWRpdG9yID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KT8uZWRpdG9yO1xuXHRcdGlmIChlZGl0b3IgPT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0Y29uc3QgY3Vyc29yID0gZWRpdG9yLmdldEN1cnNvcigpO1xuXHRcdGNvbnN0IGxpbmVDb250ZW50ID0gZWRpdG9yLmdldExpbmUoY3Vyc29yLmxpbmUpO1xuXG5cdFx0ZWRpdG9yLnJlcGxhY2VSYW5nZShcIlwiLFxuXHRcdFx0eyBsaW5lOiBjdXJzb3IubGluZSwgY2g6IDAgfSxcblx0XHRcdHsgbGluZTogY3Vyc29yLmxpbmUgKyAxLCBjaDogMCB9KTtcblxuXHRcdGNvbnN0IGZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoVEFTS1NfUEFUSCk7XG5cdFx0aWYgKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuXHRcdFx0YXdhaXQgdGhpcy5hcHAudmF1bHQuYXBwZW5kKGZpbGUsIFwiXFxuXCIgKyBsaW5lQ29udGVudCk7XG5cdFx0fVxuXHR9XG5cblx0dG9nZ2xlX2luYm94KCkge1xuXHRcdGxldCBmaWxlID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcblx0XHRpZiAoZmlsZSA9PSBudWxsKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5hcHAuZmlsZU1hbmFnZXIucHJvY2Vzc0Zyb250TWF0dGVyKGZpbGUsIChmbTogYW55KSA9PiB7XG5cdFx0XHRsZXQgdGFncyA9IHBhcnNlRnJvbnRNYXR0ZXJUYWdzKGZtKTtcblxuXHRcdFx0aWYgKHRhZ3MgPT0gbnVsbCkge1xuXHRcdFx0XHR0YWdzID0gW1wiI2luYm94XCJdO1xuXHRcdFx0fSBlbHNlIGlmICghdGFncy5pbmNsdWRlcyhcIiNpbmJveFwiKSkge1xuXHRcdFx0XHR0YWdzLnB1c2goXCIjaW5ib3hcIik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0YWdzID0gdGFncy5maWx0ZXIoKHg6IHN0cmluZykgPT4geCAhPT0gXCIjaW5ib3hcIik7XG5cdFx0XHR9XG5cdFx0XHRmbS50YWdzID0gdGFncztcblx0XHRcdHJldHVybiBmbTtcblx0XHR9KTtcblx0fVxuXG5cdGFzeW5jIGNvcHlfbWFya2Rvd24oKSB7XG5cdFx0bGV0IGZpbGUgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xuXHRcdGlmIChmaWxlID09IG51bGwpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRsZXQgY29udGVudHMgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5jYWNoZWRSZWFkKGZpbGUpO1xuXHRcdGNvbnRlbnRzID0gY29udGVudHMucmVwbGFjZSgvXi0tLVtcXHNcXFNdKj8tLS0vLCBcIlwiKTtcblx0XHRjb250ZW50cyA9IGNvbnRlbnRzLnJlcGxhY2UoL15bXFxzXFxTXSolJVxccyo/XFwtXFwtXFwtXFxzKj8lJS8sIFwiXCIpO1xuXHRcdGNvbnRlbnRzID0gY29udGVudHMucmVwbGFjZSgvXFxbXFxbKC4qPylcXHwoLio/KVxcXVxcXS9nLCBcIiQyXCIpO1xuXHRcdGNvbnRlbnRzID0gY29udGVudHMucmVwbGFjZSgvXFxbXFxbKC4qPylcXF1cXF0vZywgXCIkMVwiKTtcblx0XHRjb250ZW50cyA9IGNvbnRlbnRzLnJlcGxhY2UoLyUlW1xcc1xcU10qPyUlL2csIFwiXCIpO1xuXHRcdGNvbnRlbnRzID0gY29udGVudHMucmVwbGFjZSgvXlxccyovLCBcIlwiKTtcblx0XHRjb250ZW50cyA9IGNvbnRlbnRzLnJlcGxhY2UoL1xccyokLywgXCJcIik7XG5cblx0XHRhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChjb250ZW50cyk7XG5cdFx0bmV3IE5vdGljZShjb250ZW50cyk7XG5cdH1cblxuXHRvcGVuX2luYm94X25vdGUoKSB7XG5cdFx0Y29uc3QgZmlsZXMgPSB0aGlzLmFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCk7XG5cblx0XHRsZXQgaW5ib3hGaWxlcyA9IFtdO1xuXHRcdGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuXHRcdFx0Y29uc3QgbWMgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcblx0XHRcdGlmIChtYyA9PSBudWxsKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgdGFncyA9IGdldEFsbFRhZ3MobWMpO1xuXHRcdFx0aWYgKHRhZ3MgPT0gbnVsbCkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHRhZ3MuaW5jbHVkZXMoXCIjaW5ib3hcIilcblx0XHRcdFx0JiYgZmlsZS5wYXRoLnNlYXJjaChcIlRlbXBsYXRlc1wiKSA9PSAtMSkge1xuXHRcdFx0XHRpbmJveEZpbGVzLnB1c2goZmlsZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bGV0IGZvbGRlciA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChJTkJPWF9QQVRIKTtcblx0XHRpZiAoZm9sZGVyIGluc3RhbmNlb2YgVEZvbGRlcikge1xuXHRcdFx0aW5ib3hGaWxlcyA9IGluYm94RmlsZXMuY29uY2F0KGdldEZpbGVzUmVjdXJzaXZlKGZvbGRlcikpXG5cdFx0fVxuXG5cdFx0aW5ib3hGaWxlcy5zb3J0KChhLCBiKSA9PiB7XG5cdFx0XHQvLyBDaGVjayBpZiBmaWxlcyBhcmUgbWFya2Rvd25cblx0XHRcdGNvbnN0IGFJc01hcmtkb3duID0gYS5leHRlbnNpb24gPT09ICdtZCc7XG5cdFx0XHRjb25zdCBiSXNNYXJrZG93biA9IGIuZXh0ZW5zaW9uID09PSAnbWQnO1xuXG5cdFx0XHQvLyBJZiBvbmUgaXMgbWFya2Rvd24gYW5kIHRoZSBvdGhlciBpc24ndCwgcHJpb3JpdGl6ZSBtYXJrZG93blxuXHRcdFx0aWYgKGFJc01hcmtkb3duICYmICFiSXNNYXJrZG93bikgcmV0dXJuIC0xO1xuXHRcdFx0aWYgKCFhSXNNYXJrZG93biAmJiBiSXNNYXJrZG93bikgcmV0dXJuIDE7XG5cblx0XHRcdC8vIElmIGJvdGggYXJlIG1hcmtkb3duIG9yIGJvdGggYXJlIG5vdCwgc29ydCBieSBjcmVhdGlvbiB0aW1lXG5cdFx0XHRyZXR1cm4gYi5zdGF0LmN0aW1lIC0gYS5zdGF0LmN0aW1lO1xuXHRcdH0pO1xuXG5cdFx0aWYgKGluYm94RmlsZXMubGVuZ3RoID09IDApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRsZXQgYWN0aXZlRmlsZSA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XG5cdFx0aWYgKGFjdGl2ZUZpbGUgIT09IG51bGwpIHtcblx0XHRcdGxldCBhY3RpdmVGaWxlSW5kZXggPSBpbmJveEZpbGVzLmZpbmRJbmRleChvYmogPT4gb2JqID09IGFjdGl2ZUZpbGUpOyAvLyBXZSB3YW50IHRoZSBuZXh0IGZpbGUuXG5cdFx0XHRpZiAoYWN0aXZlRmlsZUluZGV4ID49IDApIHtcblx0XHRcdFx0aW5kZXggPSBhY3RpdmVGaWxlSW5kZXggKyAxXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aW5kZXggJT0gaW5ib3hGaWxlcy5sZW5ndGg7XG5cdFx0dGhpcy5hcHAud29ya3NwYWNlLmdldExlYWYoKS5vcGVuRmlsZShpbmJveEZpbGVzW2luZGV4XSk7XG5cdH1cblxuXHRhc3luYyB1bmlxdWVfbm90ZSgpIHtcblx0XHRjb25zdCBmaWxlID0gdGhpcy5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpLmZpbmQoXG5cdFx0XHRmID0+IGYuYmFzZW5hbWUgPT0gQkFTSUNfVEVNUExBVEUpO1xuXG5cdFx0aWYgKGZpbGUgPT0gbnVsbCkge1xuXHRcdFx0Y29uc29sZS5sb2coXCJDYW4ndCBmaW5kOiBcIiwgQkFTSUNfVEVNUExBVEUpO1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0bGV0IHN0YW1wID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDkpLnRvVXBwZXJDYXNlKCk7XG5cdFx0bGV0IG5hbWUgPSBgJHtjdXJyZW50RGF0ZSgpfSAke3N0YW1wfS5tZGA7XG5cdFx0bGV0IGNvbnRlbnRzID0gYXdhaXQgdGhpcy51bmlxdWVfbm90ZV9jb250ZW50cygpO1xuXHRcdGxldCBuZXdGaWxlID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuY3JlYXRlKG5hbWUsIGNvbnRlbnRzKTtcblx0XHRhd2FpdCB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhZigpLm9wZW5GaWxlKG5ld0ZpbGUpO1xuXG5cdFx0Y29uc3QgdmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG5cdFx0aWYgKHZpZXcgPT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHRcdHZpZXcuZWRpdG9yLmZvY3VzKCk7XG5cdH1cblxuXHRkZWxldGVfaW5ib3goKSB7XG5cdFx0bGV0IGZpbGUgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xuXHRcdHRoaXMub3Blbl9pbmJveF9ub3RlKCk7XG5cdFx0aWYgKGZpbGUgIT09IG51bGwpIHtcblx0XHRcdHRoaXMuYXBwLnZhdWx0LnRyYXNoKGZpbGUsIGZhbHNlKTtcblx0XHR9XG5cdH1cblxuXHRhc3luYyBvbmxvYWQoKSB7XG5cdFx0Ly8gSWNvbiBOYW1lcyBjb21lIGZyb206IGh0dHBzOi8vbHVjaWRlLmRldi9cblx0XHRjb25zdCBpbmJveF9uZXh0X2NiID0gKCkgPT4gdGhpcy5vcGVuX2luYm94X25vdGUoKVxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogJ2V0aGFuOmluYm94LW5leHQnLFxuXHRcdFx0bmFtZTogJ05leHQgaW5ib3gnLFxuXHRcdFx0Y2FsbGJhY2s6IGluYm94X25leHRfY2IsXG5cdFx0fSk7XG5cdFx0dGhpcy5hZGRSaWJib25JY29uKFwibWFpbHNcIiwgXCJOZXh0XCIsIGluYm94X25leHRfY2IpO1xuXG5cdFx0Y29uc3QgbmV3X25vdGVfY2IgPSAoKSA9PiB0aGlzLnVuaXF1ZV9ub3RlKClcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xuXHRcdFx0aWQ6ICdldGhhbjp1bmlxdWUtbm90ZScsXG5cdFx0XHRuYW1lOiAnTmV3IG5vdGUnLFxuXHRcdFx0Y2FsbGJhY2s6IG5ld19ub3RlX2NiLFxuXHRcdH0pO1xuXHRcdHRoaXMuYWRkUmliYm9uSWNvbihcImZpbGUtcGx1cy0yXCIsIFwiQ3JlYXRlXCIsIG5ld19ub3RlX2NiKTtcblxuXHRcdGNvbnN0IGRlbGV0ZV9pbmJveF9jYiA9ICgpID0+IHRoaXMuZGVsZXRlX2luYm94KClcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xuXHRcdFx0aWQ6ICdldGhhbjpkZWxldGUtaW5ib3gtbmV4dCcsXG5cdFx0XHRuYW1lOiAnRGVsZXRlJyxcblx0XHRcdGNhbGxiYWNrOiBkZWxldGVfaW5ib3hfY2IsXG5cdFx0fSk7XG5cdFx0dGhpcy5hZGRSaWJib25JY29uKFwidHJhc2hcIiwgXCJEZWxldGVcIiwgZGVsZXRlX2luYm94X2NiKTtcblxuXHRcdGNvbnN0IGNvcHlfbWFya2Rvd25fY2IgPSAoKSA9PiB0aGlzLmNvcHlfbWFya2Rvd24oKVxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogJ2V0aGFuOmNvcHktbWFya2Rvd24nLFxuXHRcdFx0bmFtZTogJ0NvcHkgbWFya2Rvd24nLFxuXHRcdFx0Y2FsbGJhY2s6IGNvcHlfbWFya2Rvd25fY2IsXG5cdFx0fSk7XG5cdFx0dGhpcy5hZGRSaWJib25JY29uKFwiY2xpcGJvYXJkLWNvcHlcIiwgXCJDb3B5XCIsIGNvcHlfbWFya2Rvd25fY2IpO1xuXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdGlkOiAnZXRoYW46dG9nZ2xlLWluYm94Jyxcblx0XHRcdG5hbWU6ICdUb2dnbGUgaW5ib3gnLFxuXHRcdFx0Y2FsbGJhY2s6ICgpID0+IHRoaXMudG9nZ2xlX2luYm94KClcblx0XHR9KTtcblxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogJ2V0aGFuOmFwcGVuZC10YXNrJyxcblx0XHRcdG5hbWU6ICdBcHBlbmQgVGFzaycsXG5cdFx0XHRjYWxsYmFjazogKCkgPT4gdGhpcy5hcHBlbmRfdGFzaygpXG5cdFx0fSk7XG5cblx0XHR0aGlzLmFkZENvbW1hbmQoe1xuXHRcdFx0aWQ6ICdldGhhbjpjcmVhdGUtdGFzaycsXG5cdFx0XHRuYW1lOiAnQ3JlYXRlIFRhc2snLFxuXHRcdFx0Y2FsbGJhY2s6ICgpID0+IHRoaXMuY3JlYXRlX3Rhc2soKVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5hcHAud29ya3NwYWNlLm9uTGF5b3V0UmVhZHkoKCkgPT4ge1xuXHRcdFx0dGhpcy5yZWdpc3RlckV2ZW50KHRoaXMuYXBwLnZhdWx0Lm9uKCdjcmVhdGUnLCB0aGlzLm9uX2NyZWF0ZSwgdGhpcykpO1xuXHRcdH0pO1xuXG5cdH1cblxuXHRvbnVubG9hZCgpIHsgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHNCQUFvRztBQUVwRyxJQUFNLGlCQUFpQjtBQUN2QixJQUFNLGFBQWE7QUFDbkIsSUFBTSxhQUFhO0FBRW5CLElBQUksUUFBUTtBQUVaLFNBQVMsY0FBYztBQUN0QixTQUFPLElBQUksS0FBSyxFQUFFLFlBQVksRUFBRSxNQUFNLEdBQUcsRUFBRTtBQUM1QztBQUVBLFNBQVMsa0JBQWtCLFFBQTBCO0FBQ3BELE1BQUksUUFBaUIsQ0FBQztB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
