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
var UNIQUE_NOTE_PATH = "00-09 \u{1F4BE} System/02 Obsidian/02.00 Notes";
var INBOX_PATH = "70-79 Productivity/70 System/70.01 \u{1F4E5} Inbox";
var TASKS_PATH = "70-79 Productivity/70 System/70.02 Tasks/Floating Tasks.md";
function open_inbox_note(app) {
  const files = app.vault.getMarkdownFiles();
  let inboxFiles = [];
  for (const file of files) {
    const mc = app.metadataCache.getFileCache(file);
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
  let folder = app.vault.getAbstractFileByPath(INBOX_PATH);
  if (folder instanceof import_obsidian.TFolder) {
    for (const f of folder.children) {
      if (f instanceof import_obsidian.TFile) {
        inboxFiles.push(f);
      }
    }
  }
  inboxFiles.sort((a, b) => b.stat.ctime - a.stat.ctime);
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
  app.workspace.getLeaf().openFile(inboxFiles[index]);
}
async function unique_note(app) {
  const file = app.vault.getMarkdownFiles().find(
    (f) => f.basename == UNIQUE_NOTE_TEMPLATE
  );
  if (file == null) {
    console.log("Can't find: ", UNIQUE_NOTE_TEMPLATE);
    return null;
  }
  let currentDate = new Date().toISOString().slice(0, 10);
  let contents = await app.vault.cachedRead(file);
  contents = contents.replace(/{{date}}/g, currentDate);
  let stamp = Math.random().toString(36).substring(9).toUpperCase();
  let name = `${UNIQUE_NOTE_PATH}/${currentDate} ${stamp}.md`;
  let newFile = await app.vault.create(name, contents);
  await app.workspace.getLeaf().openFile(newFile);
  const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
  if (view == null) {
    return;
  }
  view.editor.focus();
}
async function copy_markdown(app) {
  let file = app.workspace.getActiveFile();
  if (file == null) {
    return;
  }
  let contents = await app.vault.cachedRead(file);
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
function toggle_inbox(app) {
  let file = app.workspace.getActiveFile();
  if (file == null) {
    return;
  }
  app.fileManager.processFrontMatter(file, (fm) => {
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
function append_task(app) {
  var _a;
  const editor = (_a = app.workspace.getActiveViewOfType(import_obsidian.MarkdownView)) == null ? void 0 : _a.editor;
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
  const file = app.vault.getAbstractFileByPath(TASKS_PATH);
  if (file instanceof import_obsidian.TFile) {
    this.app.vault.append(file, "\n" + lineContent);
  }
}
var EthanUtil = class extends import_obsidian.Plugin {
  async onload() {
    const inbox_next_cb = () => {
      open_inbox_note(this.app);
    };
    this.addCommand({
      id: "ethan:inbox-next",
      name: "Next inbox",
      callback: inbox_next_cb
    });
    this.addRibbonIcon("mails", "Next Inbox", inbox_next_cb);
    const delete_inbox_cb = () => {
      let file = this.app.workspace.getActiveFile();
      open_inbox_note(this.app);
      if (file !== null) {
        this.app.vault.trash(file, false);
      }
    };
    this.addCommand({
      id: "ethan:delete-inbox-next",
      name: "Delete",
      callback: delete_inbox_cb
    });
    this.addRibbonIcon("trash", "Delete, Open Inbox", delete_inbox_cb);
    const new_note_cb = () => {
      unique_note(this.app);
    };
    this.addCommand({
      id: "ethan:unique-note",
      name: "New note",
      callback: new_note_cb
    });
    this.addRibbonIcon("file-plus-2", "Create Unique note", new_note_cb);
    const copy_markdown_cb = () => {
      copy_markdown(this.app);
    };
    this.addCommand({
      id: "ethan:copy-markdown",
      name: "Copy markdown",
      callback: copy_markdown_cb
    });
    const toggle_inbox_cb = () => {
      toggle_inbox(this.app);
    };
    this.addCommand({
      id: "ethan:toggle-inbox",
      name: "Toggle inbox",
      callback: toggle_inbox_cb
    });
    const append_task_cb = () => {
      append_task(this.app);
    };
    this.addCommand({
      id: "ethan:append-task",
      name: "Append Task",
      callback: append_task_cb
    });
  }
  onunload() {
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgUGx1Z2luLCBBcHAsIE1hcmtkb3duVmlldywgTm90aWNlLCBnZXRBbGxUYWdzLCBwYXJzZUZyb250TWF0dGVyVGFncywgVEZvbGRlciwgVEZpbGV9IGZyb20gJ29ic2lkaWFuJztcblxuY29uc3QgVU5JUVVFX05PVEVfVEVNUExBVEUgPSBcIlVuaXF1ZSBOb3RlIEluYm94IFRlbXBsYXRlXCI7XG5jb25zdCBVTklRVUVfTk9URV9QQVRIID1cbiAgICBcIjAwLTA5IFx1RDgzRFx1RENCRSBTeXN0ZW0vMDIgT2JzaWRpYW4vMDIuMDAgTm90ZXNcIjtcbmNvbnN0IElOQk9YX1BBVEggPSBcIjcwLTc5IFByb2R1Y3Rpdml0eS83MCBTeXN0ZW0vNzAuMDEgXHVEODNEXHVEQ0U1IEluYm94XCI7XG5jb25zdCBUQVNLU19QQVRIID0gXCI3MC03OSBQcm9kdWN0aXZpdHkvNzAgU3lzdGVtLzcwLjAyIFRhc2tzL0Zsb2F0aW5nIFRhc2tzLm1kXCI7XG5cbmZ1bmN0aW9uIG9wZW5faW5ib3hfbm90ZShhcHA6IEFwcCkge1xuICAgIGNvbnN0IGZpbGVzID0gYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcblxuICAgIGxldCBpbmJveEZpbGVzID0gW107XG4gICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICAgIGNvbnN0IG1jID0gYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKGZpbGUpO1xuICAgICAgICBpZiAobWMgPT0gbnVsbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdGFncyA9IGdldEFsbFRhZ3MobWMpO1xuICAgICAgICBpZiAodGFncyA9PSBudWxsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0YWdzLmluY2x1ZGVzKFwiI2luYm94XCIpXG4gICAgICAgICAgICAmJiBmaWxlLnBhdGguc2VhcmNoKFwiVGVtcGxhdGVzXCIpID09IC0xKSB7XG4gICAgICAgICAgICBpbmJveEZpbGVzLnB1c2goZmlsZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgZm9sZGVyID0gYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChJTkJPWF9QQVRIKTtcbiAgICBpZiAoZm9sZGVyIGluc3RhbmNlb2YgVEZvbGRlcikge1xuICAgICAgICBmb3IgKGNvbnN0IGYgb2YgZm9sZGVyLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICBpZiAoZiBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgICAgICAgICAgaW5ib3hGaWxlcy5wdXNoKGYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5ib3hGaWxlcy5zb3J0KCgoYSwgYikgPT4gYi5zdGF0LmN0aW1lIC0gYS5zdGF0LmN0aW1lKSk7XG5cbiAgICBpZiAoaW5ib3hGaWxlcy5sZW5ndGggPT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGluZGV4ID0gMDtcbiAgICBsZXQgYWN0aXZlRmlsZSA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XG4gICAgaWYgKGFjdGl2ZUZpbGUgIT09IG51bGwpIHtcbiAgICAgICAgaW5kZXggPSBpbmJveEZpbGVzLmZpbmRJbmRleChvYmogPT4gb2JqID09IGFjdGl2ZUZpbGUpOyAvLyBXZSB3YW50IHRoZSBuZXh0IGZpbGUuXG4gICAgICAgIGlmIChpbmRleCA8IDApIHtcbiAgICAgICAgICAgIGluZGV4ID0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgaW5kZXggPSAoaW5kZXggKyAxKSAlIGluYm94RmlsZXMubGVuZ3RoO1xuICAgIH1cblxuICAgIGFwcC53b3Jrc3BhY2UuZ2V0TGVhZigpLm9wZW5GaWxlKGluYm94RmlsZXNbaW5kZXhdKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gdW5pcXVlX25vdGUoYXBwOiBBcHApIHtcbiAgICBjb25zdCBmaWxlID0gYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKS5maW5kKFxuICAgICAgICBmID0+IGYuYmFzZW5hbWUgPT0gVU5JUVVFX05PVEVfVEVNUExBVEUpO1xuXG4gICAgaWYgKGZpbGUgPT0gbnVsbCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNhbid0IGZpbmQ6IFwiLCBVTklRVUVfTk9URV9URU1QTEFURSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGxldCBjdXJyZW50RGF0ZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxMCk7XG4gICAgbGV0IGNvbnRlbnRzID0gYXdhaXQgYXBwLnZhdWx0LmNhY2hlZFJlYWQoZmlsZSk7XG4gICAgY29udGVudHMgPSBjb250ZW50cy5yZXBsYWNlKC97e2RhdGV9fS9nLCBjdXJyZW50RGF0ZSk7XG5cbiAgICBsZXQgc3RhbXAgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoOSkudG9VcHBlckNhc2UoKTtcbiAgICBsZXQgbmFtZSA9IGAke1VOSVFVRV9OT1RFX1BBVEh9LyR7Y3VycmVudERhdGV9ICR7c3RhbXB9Lm1kYDtcbiAgICBsZXQgbmV3RmlsZSA9IGF3YWl0IGFwcC52YXVsdC5jcmVhdGUobmFtZSwgY29udGVudHMpO1xuICAgIGF3YWl0IGFwcC53b3Jrc3BhY2UuZ2V0TGVhZigpLm9wZW5GaWxlKG5ld0ZpbGUpO1xuXG4gICAgY29uc3QgdmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG4gICAgaWYgKHZpZXcgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm5cbiAgICB9XG4gICAgdmlldy5lZGl0b3IuZm9jdXMoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gY29weV9tYXJrZG93bihhcHA6IEFwcCkge1xuICAgIGxldCBmaWxlID0gYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XG4gICAgaWYgKGZpbGUgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGNvbnRlbnRzID0gYXdhaXQgYXBwLnZhdWx0LmNhY2hlZFJlYWQoZmlsZSk7XG4gICAgY29udGVudHMgPSBjb250ZW50cy5yZXBsYWNlKC9eLS0tW1xcc1xcU10qPy0tLS8sIFwiXCIpO1xuICAgIGNvbnRlbnRzID0gY29udGVudHMucmVwbGFjZSgvXltcXHNcXFNdKiUlXFxzKj9cXC1cXC1cXC1cXHMqPyUlLywgXCJcIik7XG4gICAgY29udGVudHMgPSBjb250ZW50cy5yZXBsYWNlKC9cXFtcXFsoLio/KVxcfCguKj8pXFxdXFxdL2csIFwiJDJcIik7XG4gICAgY29udGVudHMgPSBjb250ZW50cy5yZXBsYWNlKC9cXFtcXFsoLio/KVxcXVxcXS9nLCBcIiQxXCIpO1xuICAgIGNvbnRlbnRzID0gY29udGVudHMucmVwbGFjZSgvJSVbXFxzXFxTXSo/JSUvZywgXCJcIik7XG4gICAgY29udGVudHMgPSBjb250ZW50cy5yZXBsYWNlKC9eXFxzKi8sIFwiXCIpO1xuICAgIGNvbnRlbnRzID0gY29udGVudHMucmVwbGFjZSgvXFxzKiQvLCBcIlwiKTtcblxuICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGNvbnRlbnRzKTtcbiAgICBuZXcgTm90aWNlKGNvbnRlbnRzKTtcbn1cblxuZnVuY3Rpb24gdG9nZ2xlX2luYm94KGFwcDogQXBwKSB7XG4gICAgbGV0IGZpbGUgPSBhcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcbiAgICBpZiAoZmlsZSA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBhcHAuZmlsZU1hbmFnZXIucHJvY2Vzc0Zyb250TWF0dGVyKGZpbGUsIChmbTogYW55KSA9PiB7XG4gICAgICAgIGxldCB0YWdzID0gcGFyc2VGcm9udE1hdHRlclRhZ3MoZm0pO1xuXG4gICAgICAgIGlmICh0YWdzID09IG51bGwpIHtcbiAgICAgICAgICAgIHRhZ3MgPSBbXCIjaW5ib3hcIl07XG4gICAgICAgIH0gZWxzZSBpZiAoIXRhZ3MuaW5jbHVkZXMoXCIjaW5ib3hcIikpIHtcbiAgICAgICAgICAgIHRhZ3MucHVzaChcIiNpbmJveFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhZ3MgPSB0YWdzLmZpbHRlcigoeCA6c3RyaW5nKSA9PiB4ICE9PSBcIiNpbmJveFwiKTtcbiAgICAgICAgfVxuICAgICAgICBmbS50YWdzID0gdGFncztcbiAgICAgICAgcmV0dXJuIGZtO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBhcHBlbmRfdGFzayhhcHA6IEFwcCkge1xuICAgIGNvbnN0IGVkaXRvciA9IGFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpPy5lZGl0b3I7XG4gICAgaWYgKGVkaXRvciA9PSBudWxsKSB7XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGN1cnNvciA9IGVkaXRvci5nZXRDdXJzb3IoKTtcbiAgICBjb25zdCBsaW5lQ29udGVudCA9IGVkaXRvci5nZXRMaW5lKGN1cnNvci5saW5lKTtcblxuICAgIGVkaXRvci5yZXBsYWNlUmFuZ2UoXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbGluZTogY3Vyc29yLmxpbmUsIGNoOiAwIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGxpbmU6IGN1cnNvci5saW5lICsgMSwgY2g6IDAgfSk7XG5cbiAgICBjb25zdCBmaWxlID0gYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChUQVNLU19QQVRIKTtcbiAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgIHRoaXMuYXBwLnZhdWx0LmFwcGVuZChmaWxlLCBcIlxcblwiICsgbGluZUNvbnRlbnQpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXRoYW5VdGlsIGV4dGVuZHMgUGx1Z2luIHtcbiAgICBhc3luYyBvbmxvYWQoKSB7XG4gICAgICAgIC8vIEluYm94IE5leHRcbiAgICAgICAgY29uc3QgaW5ib3hfbmV4dF9jYiA9ICAoKSA9PiB7XG4gICAgICAgICAgICBvcGVuX2luYm94X25vdGUodGhpcy5hcHApO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICAgICAgICBpZDogJ2V0aGFuOmluYm94LW5leHQnLFxuICAgICAgICAgICAgbmFtZTogJ05leHQgaW5ib3gnLFxuICAgICAgICAgICAgY2FsbGJhY2s6IGluYm94X25leHRfY2IsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmFkZFJpYmJvbkljb24oXCJtYWlsc1wiLCBcIk5leHQgSW5ib3hcIiwgaW5ib3hfbmV4dF9jYik7XG5cblxuICAgICAgICAvLyBEZWxldGUgYW5kIEluYm94IE5leHRcbiAgICAgICAgY29uc3QgZGVsZXRlX2luYm94X2NiID0gKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGZpbGUgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xuICAgICAgICAgICAgb3Blbl9pbmJveF9ub3RlKHRoaXMuYXBwKTtcbiAgICAgICAgICAgIGlmIChmaWxlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHAudmF1bHQudHJhc2goZmlsZSwgZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICAgICAgICBpZDogJ2V0aGFuOmRlbGV0ZS1pbmJveC1uZXh0JyxcbiAgICAgICAgICAgIG5hbWU6ICdEZWxldGUnLFxuICAgICAgICAgICAgY2FsbGJhY2s6IGRlbGV0ZV9pbmJveF9jYixcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYWRkUmliYm9uSWNvbihcInRyYXNoXCIsIFwiRGVsZXRlLCBPcGVuIEluYm94XCIsIGRlbGV0ZV9pbmJveF9jYik7XG5cblxuICAgICAgICAvLyBVbmlxdWUgTm90ZVxuICAgICAgICBjb25zdCBuZXdfbm90ZV9jYiA9ICgpID0+IHtcbiAgICAgICAgICAgIHVuaXF1ZV9ub3RlKHRoaXMuYXBwKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgICAgICAgIGlkOiAnZXRoYW46dW5pcXVlLW5vdGUnLFxuICAgICAgICAgICAgbmFtZTogJ05ldyBub3RlJyxcbiAgICAgICAgICAgIGNhbGxiYWNrOiBuZXdfbm90ZV9jYixcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5hZGRSaWJib25JY29uKFwiZmlsZS1wbHVzLTJcIiwgXCJDcmVhdGUgVW5pcXVlIG5vdGVcIiwgbmV3X25vdGVfY2IpO1xuXG4gICAgICAgIC8vIENvcHkgTWFya2Rvd25cbiAgICAgICAgY29uc3QgY29weV9tYXJrZG93bl9jYiA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvcHlfbWFya2Rvd24odGhpcy5hcHApO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgICAgICAgaWQ6ICdldGhhbjpjb3B5LW1hcmtkb3duJyxcbiAgICAgICAgICAgIG5hbWU6ICdDb3B5IG1hcmtkb3duJyxcbiAgICAgICAgICAgIGNhbGxiYWNrOiBjb3B5X21hcmtkb3duX2NiLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBUb2dnbGUgSW5ib3hcbiAgICAgICAgY29uc3QgdG9nZ2xlX2luYm94X2NiID0gKCkgPT4ge1xuICAgICAgICAgICAgdG9nZ2xlX2luYm94KHRoaXMuYXBwKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgICAgICAgIGlkOiAnZXRoYW46dG9nZ2xlLWluYm94JyxcbiAgICAgICAgICAgIG5hbWU6ICdUb2dnbGUgaW5ib3gnLFxuICAgICAgICAgICAgY2FsbGJhY2s6IHRvZ2dsZV9pbmJveF9jYixcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgYXBwZW5kX3Rhc2tfY2IgPSAoKSA9PiB7XG4gICAgICAgICAgICBhcHBlbmRfdGFzayh0aGlzLmFwcCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICAgICAgICBpZDogJ2V0aGFuOmFwcGVuZC10YXNrJyxcbiAgICAgICAgICAgIG5hbWU6ICdBcHBlbmQgVGFzaycsXG4gICAgICAgICAgICBjYWxsYmFjazogYXBwZW5kX3Rhc2tfY2IsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9udW5sb2FkKCkge31cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxzQkFBbUc7QUFFbkcsSUFBTSx1QkFBdUI7QUFDN0IsSUFBTSxtQkFDRjtBQUNKLElBQU0sYUFBYTtBQUNuQixJQUFNLGFBQWE7QUFFbkIsU0FBUyxnQkFBZ0IsS0FBVTtBQUMvQixRQUFNLFFBQVEsSUFBSSxNQUFNLGlCQUFpQjtBQUV6QyxNQUFJLGFBQWEsQ0FBQztBQUNsQixhQUFXLFFBQVEsT0FBTztBQUN0QixVQUFNLEtBQUssSUFBSSxjQUFjLGFBQWEsSUFBSTtBQUM5QyxRQUFJLE1BQU0sTUFBTTtBQUNaO0FBQUEsSUFDSjtBQUVBLFFBQUksV0FBTyw0QkFBVyxFQUFFO0FBQ3hCLFFBQUksUUFBUSxNQUFNO0FBQ2Q7QUFBQSxJQUNKO0FBRUEsUUFBSSxLQUFLLFNBQVMsUUFBUSxLQUNuQixLQUFLLEtBQUssT0FBTyxXQUFXLEtBQUssSUFBSTtBQUN4QyxpQkFBVyxLQUFLLElBQUk7QUFBQSxJQUN4QjtBQUFBLEVBQ0o7QUFFQSxNQUFJLFNBQVMsSUFBSSxNQUFNLHNCQUFzQixVQUFVO0FBQ3ZELE1BQUksa0JBQWtCLHlCQUFTO0FBQzNCLGVBQVcsS0FBSyxPQUFPLFVBQVU7QUFDN0IsVUFBSSxhQUFhLHVCQUFPO0FBQ3BCLG1CQUFXLEtBQUssQ0FBQztBQUFBLE1BQ3JCO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFFQSxhQUFXLEtBQU0sQ0FBQyxHQUFHLE1BQU0sRUFBRSxLQUFLLFFBQVEsRUFBRSxLQUFLLEtBQU07QUFFdkQsTUFBSSxXQUFXLFVBQVUsR0FBRztBQUN4QjtBQUFBLEVBQ0o7QUFFQSxNQUFJLFFBQVE7QUFDWixNQUFJLGFBQWEsS0FBSyxJQUFJLFVBQVUsY0FBYztBQUNsRCxNQUFJLGVBQWUsTUFBTTtBQUNyQixZQUFRLFdBQVcsVUFBVSxTQUFPLE9BQU8sVUFBVTtBQUNyRCxRQUFJLFFBQVEsR0FBRztBQUNYLGNBQVE7QUFBQSxJQUNaO0FBQ0EsYUFBUyxRQUFRLEtBQUssV0FBVztBQUFBLEVBQ3JDO0FBRUEsTUFBSSxVQUFVLFFBQVEsRUFBRSxTQUFTLFdBQVcsS0FBSyxDQUFDO0FBQ3REO0FBRUEsZUFBZSxZQUFZLEtBQVU7QUFDakMsUUFBTSxPQUFPLElBQUksTUFBTSxpQkFBaUIsRUFBRTtBQUFBLElBQ3RDLE9BQUssRUFBRSxZQUFZO0FBQUEsRUFBb0I7QUFFM0MsTUFBSSxRQUFRLE1BQU07QUFDZCxZQUFRLElBQUksZ0JBQWdCLG9CQUFvQjtBQUNoRCxXQUFPO0FBQUEsRUFDWDtBQUVBLE1BQUksY0FBYyxJQUFJLEtBQUssRUFBRSxZQUFZLEVBQUUsTUFBTSxHQUFHLEVBQUU7QUFDdEQsTUFBSSxXQUFXLE1BQU0sSUFBSSxNQUFNLFdBQVcsSUFBSTtBQUM5QyxhQUFXLFNBQVMsUUFBUSxhQUFhLFdBQVc7QUFFcEQsTUFBSSxRQUFRLEtBQUssT0FBTyxFQUFFLFNBQVMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxFQUFFLFlBQVk7QUFDaEUsTUFBSSxPQUFPLEdBQUcsb0JBQW9CLGVBQWU7QUFDakQsTUFBSSxVQUFVLE1BQU0sSUFBSSxNQUFNLE9BQU8sTUFBTSxRQUFRO0FBQ25ELFFBQU0sSUFBSSxVQUFVLFFBQVEsRUFBRSxTQUFTLE9BQU87QUFFOUMsUUFBTSxPQUFPLEtBQUssSUFBSSxVQUFVLG9CQUFvQiw0QkFBWTtBQUNoRSxNQUFJLFFBQVEsTUFBTTtBQUNkO0FBQUEsRUFDSjtBQUNBLE9BQUssT0FBTyxNQUFNO0FBQ3RCO0FBRUEsZUFBZSxjQUFjLEtBQVU7QUFDbkMsTUFBSSxPQUFPLElBQUksVUFBVSxjQUFjO0FBQ3ZDLE1BQUksUUFBUSxNQUFNO0FBQ2Q7QUFBQSxFQUNKO0FBRUEsTUFBSSxXQUFXLE1BQU0sSUFBSSxNQUFNLFdBQVcsSUFBSTtBQUM5QyxhQUFXLFNBQVMsUUFBUSxtQkFBbUIsRUFBRTtBQUNqRCxhQUFXLFNBQVMsUUFBUSw4QkFBOEIsRUFBRTtBQUM1RCxhQUFXLFNBQVMsUUFBUSx5QkFBeUIsSUFBSTtBQUN6RCxhQUFXLFNBQVMsUUFBUSxrQkFBa0IsSUFBSTtBQUNsRCxhQUFXLFNBQVMsUUFBUSxpQkFBaUIsRUFBRTtBQUMvQyxhQUFXLFNBQVMsUUFBUSxRQUFRLEVBQUU7QUFDdEMsYUFBVyxTQUFTLFFBQVEsUUFBUSxFQUFFO0FBRXRDLFFBQU0sVUFBVSxVQUFVLFVBQVUsUUFBUTtBQUM1QyxNQUFJLHVCQUFPLFFBQVE7QUFDdkI7QUFFQSxTQUFTLGFBQWEsS0FBVTtBQUM1QixNQUFJLE9BQU8sSUFBSSxVQUFVLGNBQWM7QUFDdkMsTUFBSSxRQUFRLE1BQU07QUFDZDtBQUFBLEVBQ0o7QUFFQSxNQUFJLFlBQVksbUJBQW1CLE1BQU0sQ0FBQyxPQUFZO0FBQ2xELFFBQUksV0FBTyxzQ0FBcUIsRUFBRTtBQUVsQyxRQUFJLFFBQVEsTUFBTTtBQUNkLGFBQU8sQ0FBQyxRQUFRO0FBQUEsSUFDcEIsV0FBVyxDQUFDLEtBQUssU0FBUyxRQUFRLEdBQUc7QUFDakMsV0FBSyxLQUFLLFFBQVE7QUFBQSxJQUN0QixPQUFPO0FBQ0gsYUFBTyxLQUFLLE9BQU8sQ0FBQyxNQUFjLE1BQU0sUUFBUTtBQUFBLElBQ3BEO0FBQ0EsT0FBRyxPQUFPO0FBQ1YsV0FBTztBQUFBLEVBQ1gsQ0FBQztBQUNMO0FBRUEsU0FBUyxZQUFZLEtBQVU7QUExSC9CO0FBMkhJLFFBQU0sVUFBUyxTQUFJLFVBQVUsb0JBQW9CLDRCQUFZLE1BQTlDLG1CQUFpRDtBQUNoRSxNQUFJLFVBQVUsTUFBTTtBQUNoQjtBQUFBLEVBQ0o7QUFFQSxRQUFNLFNBQVMsT0FBTyxVQUFVO0FBQ2hDLFFBQU0sY0FBYyxPQUFPLFFBQVEsT0FBTyxJQUFJO0FBRTlDLFNBQU87QUFBQSxJQUFhO0FBQUEsSUFDQSxFQUFFLE1BQU0sT0FBTyxNQUFNLElBQUksRUFBRTtBQUFBLElBQzNCLEVBQUUsTUFBTSxPQUFPLE9BQU8sR0FBRyxJQUFJLEVBQUU7QUFBQSxFQUFDO0FBRXBELFFBQU0sT0FBTyxJQUFJLE1BQU0sc0JBQXNCLFVBQVU7QUFDdkQsTUFBSSxnQkFBZ0IsdUJBQU87QUFDdkIsU0FBSyxJQUFJLE1BQU0sT0FBTyxNQUFNLE9BQU8sV0FBVztBQUFBLEVBQ2xEO0FBQ0o7QUFFQSxJQUFxQixZQUFyQixjQUF1Qyx1QkFBTztBQUFBLEVBQzFDLE1BQU0sU0FBUztBQUVYLFVBQU0sZ0JBQWlCLE1BQU07QUFDekIsc0JBQWdCLEtBQUssR0FBRztBQUFBLElBQzVCO0FBRUEsU0FBSyxXQUFXO0FBQUEsTUFDWixJQUFJO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixVQUFVO0FBQUEsSUFDZCxDQUFDO0FBQ0QsU0FBSyxjQUFjLFNBQVMsY0FBYyxhQUFhO0FBSXZELFVBQU0sa0JBQWtCLE1BQU07QUFDMUIsVUFBSSxPQUFPLEtBQUssSUFBSSxVQUFVLGNBQWM7QUFDNUMsc0JBQWdCLEtBQUssR0FBRztBQUN4QixVQUFJLFNBQVMsTUFBTTtBQUNmLGFBQUssSUFBSSxNQUFNLE1BQU0sTUFBTSxLQUFLO0FBQUEsTUFDcEM7QUFBQSxJQUNKO0FBRUEsU0FBSyxXQUFXO0FBQUEsTUFDWixJQUFJO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixVQUFVO0FBQUEsSUFDZCxDQUFDO0FBQ0QsU0FBSyxjQUFjLFNBQVMsc0JBQXNCLGVBQWU7QUFJakUsVUFBTSxjQUFjLE1BQU07QUFDdEIsa0JBQVksS0FBSyxHQUFHO0FBQUEsSUFDeEI7QUFDQSxTQUFLLFdBQVc7QUFBQSxNQUNaLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQSxJQUNkLENBQUM7QUFFRCxTQUFLLGNBQWMsZUFBZSxzQkFBc0IsV0FBVztBQUduRSxVQUFNLG1CQUFtQixNQUFNO0FBQzNCLG9CQUFjLEtBQUssR0FBRztBQUFBLElBQzFCO0FBQ0EsU0FBSyxXQUFXO0FBQUEsTUFDWixJQUFJO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixVQUFVO0FBQUEsSUFDZCxDQUFDO0FBR0QsVUFBTSxrQkFBa0IsTUFBTTtBQUMxQixtQkFBYSxLQUFLLEdBQUc7QUFBQSxJQUN6QjtBQUNBLFNBQUssV0FBVztBQUFBLE1BQ1osSUFBSTtBQUFBLE1BQ0osTUFBTTtBQUFBLE1BQ04sVUFBVTtBQUFBLElBQ2QsQ0FBQztBQUVELFVBQU0saUJBQWlCLE1BQU07QUFDekIsa0JBQVksS0FBSyxHQUFHO0FBQUEsSUFDeEI7QUFDQSxTQUFLLFdBQVc7QUFBQSxNQUNaLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQSxJQUNkLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFFQSxXQUFXO0FBQUEsRUFBQztBQUNoQjsiLAogICJuYW1lcyI6IFtdCn0K
