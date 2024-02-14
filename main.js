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
function open_inbox_note(app) {
  const files = app.vault.getMarkdownFiles();
  let inboxFiles = [];
  for (const file of files) {
    const mc = app.metadataCache.getFileCache(file);
    if (mc == null) {
      return;
    }
    let tags = (0, import_obsidian.getAllTags)(mc);
    if (tags == null) {
      return;
    }
    if (tags.includes("#inbox") && file.path.search("Templates") == -1) {
      inboxFiles.push(file);
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
  app.workspace.openLinkText(inboxFiles[index].basename, "", false, {
    active: true
  });
}
async function unique_note(app) {
  let currentDate = new Date().toISOString().slice(0, 10);
  let stamp = Math.random().toString(36).substring(9).toUpperCase();
  let name = `${currentDate} ${stamp}.md`;
  const file = app.vault.getMarkdownFiles().find(
    (f) => f.basename == UNIQUE_NOTE_TEMPLATE
  );
  if (file == null) {
    console.log("Can't find: ", UNIQUE_NOTE_TEMPLATE);
    return null;
  }
  let contents = await app.vault.cachedRead(file);
  contents = contents.replace(/{{date}}/g, currentDate);
  let newFile = await app.vault.create(name, contents);
  await app.workspace.openLinkText(newFile.basename, "", false, {
    active: true
  });
  const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
  if (view == null) {
    return;
  }
  console.log("here");
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
      return;
    }
    if (tags.includes("#inbox")) {
      tags = tags.filter((x) => x !== "#inbox");
    } else {
      tags.push("#inbox");
    }
    fm.tags = tags;
    return fm;
  });
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
  }
  onunload() {
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgUGx1Z2luLCBBcHAsIE1hcmtkb3duVmlldywgTm90aWNlLCBnZXRBbGxUYWdzLCBwYXJzZUZyb250TWF0dGVyVGFnc30gZnJvbSAnb2JzaWRpYW4nO1xuXG5jb25zdCBVTklRVUVfTk9URV9URU1QTEFURSA9IFwiVW5pcXVlIE5vdGUgSW5ib3ggVGVtcGxhdGVcIjtcblxuZnVuY3Rpb24gb3Blbl9pbmJveF9ub3RlKGFwcDogQXBwKSB7XG5cdC8vIGNvbnN0IGZpbGVzID0gdGhpcy5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpO1xuXHRjb25zdCBmaWxlcyA9IGFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCk7XG5cblx0bGV0IGluYm94RmlsZXMgPSBbXTtcblx0Zm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG5cdFx0Y29uc3QgbWMgPSBhcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk7XG5cdFx0aWYgKG1jID09IG51bGwpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblxuXHRcdGxldCB0YWdzID0gZ2V0QWxsVGFncyhtYyk7XG5cdFx0aWYgKHRhZ3MgPT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0aWYgKHRhZ3MuaW5jbHVkZXMoXCIjaW5ib3hcIilcblx0XHRcdCYmIGZpbGUucGF0aC5zZWFyY2goXCJUZW1wbGF0ZXNcIikgPT0gLTEpIHtcblx0XHRcdGluYm94RmlsZXMucHVzaChmaWxlKTtcblx0XHR9XG5cdH1cblxuXHRpbmJveEZpbGVzLnNvcnQoKChhLCBiKSA9PiBiLnN0YXQuY3RpbWUgLSBhLnN0YXQuY3RpbWUpKTtcblxuXHRpZiAoaW5ib3hGaWxlcy5sZW5ndGggPT0gMCkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGxldCBpbmRleCA9IDA7XG5cdGxldCBhY3RpdmVGaWxlID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcblx0aWYgKGFjdGl2ZUZpbGUgIT09IG51bGwpIHtcblx0XHRpbmRleCA9IGluYm94RmlsZXMuZmluZEluZGV4KG9iaiA9PiBvYmogPT0gYWN0aXZlRmlsZSk7IC8vIFdlIHdhbnQgdGhlIG5leHQgZmlsZS5cblx0XHRpZiAoaW5kZXggPCAwKSB7XG5cdFx0XHRpbmRleCA9IC0xO1xuXHRcdH1cblx0XHRpbmRleCA9IChpbmRleCArIDEpICUgaW5ib3hGaWxlcy5sZW5ndGg7XG5cdH1cblxuXHRhcHAud29ya3NwYWNlLm9wZW5MaW5rVGV4dChpbmJveEZpbGVzW2luZGV4XS5iYXNlbmFtZSwgJycsIGZhbHNlLCB7XG5cdFx0YWN0aXZlOiB0cnVlLFxuXHR9KVxufVxuXG5hc3luYyBmdW5jdGlvbiB1bmlxdWVfbm90ZShhcHA6IEFwcCkge1xuXHRsZXQgY3VycmVudERhdGUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc2xpY2UoMCwgMTApO1xuXHRsZXQgc3RhbXAgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoOSkudG9VcHBlckNhc2UoKTtcblx0bGV0IG5hbWUgPSBgJHtjdXJyZW50RGF0ZX0gJHtzdGFtcH0ubWRgO1xuXG5cdGNvbnN0IGZpbGUgPSBhcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpLmZpbmQoXG5cdFx0ZiA9PiBmLmJhc2VuYW1lID09IFVOSVFVRV9OT1RFX1RFTVBMQVRFKTtcblxuXHRpZiAoZmlsZSA9PSBudWxsKSB7XG5cdFx0Y29uc29sZS5sb2coXCJDYW4ndCBmaW5kOiBcIiwgVU5JUVVFX05PVEVfVEVNUExBVEUpO1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0bGV0IGNvbnRlbnRzID0gYXdhaXQgYXBwLnZhdWx0LmNhY2hlZFJlYWQoZmlsZSk7XG5cdGNvbnRlbnRzID0gY29udGVudHMucmVwbGFjZSgve3tkYXRlfX0vZywgY3VycmVudERhdGUpO1xuXG5cdGxldCBuZXdGaWxlID0gYXdhaXQgYXBwLnZhdWx0LmNyZWF0ZShuYW1lLCBjb250ZW50cyk7XG5cdGF3YWl0IGFwcC53b3Jrc3BhY2Uub3BlbkxpbmtUZXh0KG5ld0ZpbGUuYmFzZW5hbWUsIFwiXCIsIGZhbHNlLCB7XG5cdFx0YWN0aXZlOiB0cnVlLFxuXHR9KTtcblxuXHRjb25zdCB2aWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcblx0aWYgKHZpZXcgPT0gbnVsbCkge1xuXHRcdHJldHVyblxuXHR9XG5cdGNvbnNvbGUubG9nKFwiaGVyZVwiKTtcblx0dmlldy5lZGl0b3IuZm9jdXMoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gY29weV9tYXJrZG93bihhcHA6IEFwcCkge1xuXHRsZXQgZmlsZSA9IGFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xuXHRpZiAoZmlsZSA9PSBudWxsKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0bGV0IGNvbnRlbnRzID0gYXdhaXQgYXBwLnZhdWx0LmNhY2hlZFJlYWQoZmlsZSk7XG5cdGNvbnRlbnRzID0gY29udGVudHMucmVwbGFjZSgvXi0tLVtcXHNcXFNdKj8tLS0vLCBcIlwiKTtcblx0Y29udGVudHMgPSBjb250ZW50cy5yZXBsYWNlKC9eW1xcc1xcU10qJSVcXHMqP1xcLVxcLVxcLVxccyo/JSUvLCBcIlwiKTtcblx0Y29udGVudHMgPSBjb250ZW50cy5yZXBsYWNlKC9cXFtcXFsoLio/KVxcfCguKj8pXFxdXFxdL2csIFwiJDJcIik7XG5cdGNvbnRlbnRzID0gY29udGVudHMucmVwbGFjZSgvXFxbXFxbKC4qPylcXF1cXF0vZywgXCIkMVwiKTtcblx0Y29udGVudHMgPSBjb250ZW50cy5yZXBsYWNlKC8lJVtcXHNcXFNdKj8lJS9nLCBcIlwiKTtcblx0Y29udGVudHMgPSBjb250ZW50cy5yZXBsYWNlKC9eXFxzKi8sIFwiXCIpO1xuXHRjb250ZW50cyA9IGNvbnRlbnRzLnJlcGxhY2UoL1xccyokLywgXCJcIik7XG5cblx0YXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoY29udGVudHMpO1xuXHRuZXcgTm90aWNlKGNvbnRlbnRzKTtcbn1cblxuZnVuY3Rpb24gdG9nZ2xlX2luYm94KGFwcDogQXBwKSB7XG5cdGxldCBmaWxlID0gYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XG5cdGlmIChmaWxlID09IG51bGwpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRhcHAuZmlsZU1hbmFnZXIucHJvY2Vzc0Zyb250TWF0dGVyKGZpbGUsIChmbTogYW55KSA9PiB7XG5cdFx0bGV0IHRhZ3MgPSBwYXJzZUZyb250TWF0dGVyVGFncyhmbSk7XG5cdFx0aWYgKHRhZ3MgPT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0aWYgKHRhZ3MuaW5jbHVkZXMoXCIjaW5ib3hcIikpIHtcblx0XHRcdHRhZ3MgPSB0YWdzLmZpbHRlcigoeCA6c3RyaW5nKSA9PiB4ICE9PSBcIiNpbmJveFwiKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGFncy5wdXNoKFwiI2luYm94XCIpO1xuXHRcdH1cblx0XHRmbS50YWdzID0gdGFncztcblx0XHRyZXR1cm4gZm07XG5cdH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdGhhblV0aWwgZXh0ZW5kcyBQbHVnaW4ge1xuXHRhc3luYyBvbmxvYWQoKSB7XG5cdFx0Ly8gSW5ib3ggTmV4dFxuXHRcdGNvbnN0IGluYm94X25leHRfY2IgPSAgKCkgPT4ge1xuXHRcdFx0b3Blbl9pbmJveF9ub3RlKHRoaXMuYXBwKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdGlkOiAnZXRoYW46aW5ib3gtbmV4dCcsXG5cdFx0XHRuYW1lOiAnTmV4dCBpbmJveCcsXG5cdFx0XHRjYWxsYmFjazogaW5ib3hfbmV4dF9jYixcblx0XHR9KTtcblx0XHR0aGlzLmFkZFJpYmJvbkljb24oXCJtYWlsc1wiLCBcIk5leHQgSW5ib3hcIiwgaW5ib3hfbmV4dF9jYik7XG5cblxuXHRcdC8vIERlbGV0ZSBhbmQgSW5ib3ggTmV4dFxuXHRcdGNvbnN0IGRlbGV0ZV9pbmJveF9jYiA9ICgpID0+IHtcblx0XHRcdGxldCBmaWxlID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcblx0XHRcdG9wZW5faW5ib3hfbm90ZSh0aGlzLmFwcCk7XG5cdFx0XHRpZiAoZmlsZSAhPT0gbnVsbCkge1xuXHRcdFx0XHR0aGlzLmFwcC52YXVsdC50cmFzaChmaWxlLCBmYWxzZSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogJ2V0aGFuOmRlbGV0ZS1pbmJveC1uZXh0Jyxcblx0XHRcdG5hbWU6ICdEZWxldGUnLFxuXHRcdFx0Y2FsbGJhY2s6IGRlbGV0ZV9pbmJveF9jYixcblx0XHR9KTtcblx0XHR0aGlzLmFkZFJpYmJvbkljb24oXCJ0cmFzaFwiLCBcIkRlbGV0ZSwgT3BlbiBJbmJveFwiLCBkZWxldGVfaW5ib3hfY2IpO1xuXG5cblx0XHQvLyBVbmlxdWUgTm90ZVxuXHRcdGNvbnN0IG5ld19ub3RlX2NiID0gKCkgPT4ge1xuXHRcdFx0dW5pcXVlX25vdGUodGhpcy5hcHApO1xuXHRcdH07XG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdGlkOiAnZXRoYW46dW5pcXVlLW5vdGUnLFxuXHRcdFx0bmFtZTogJ05ldyBub3RlJyxcblx0XHRcdGNhbGxiYWNrOiBuZXdfbm90ZV9jYixcblx0XHR9KTtcblxuXHRcdHRoaXMuYWRkUmliYm9uSWNvbihcImZpbGUtcGx1cy0yXCIsIFwiQ3JlYXRlIFVuaXF1ZSBub3RlXCIsIG5ld19ub3RlX2NiKTtcblxuXHRcdC8vIENvcHkgTWFya2Rvd25cblx0XHRjb25zdCBjb3B5X21hcmtkb3duX2NiID0gKCkgPT4ge1xuXHRcdFx0Y29weV9tYXJrZG93bih0aGlzLmFwcCk7XG5cdFx0fTtcblx0XHR0aGlzLmFkZENvbW1hbmQoe1xuXHRcdFx0aWQ6ICdldGhhbjpjb3B5LW1hcmtkb3duJyxcblx0XHRcdG5hbWU6ICdDb3B5IG1hcmtkb3duJyxcblx0XHRcdGNhbGxiYWNrOiBjb3B5X21hcmtkb3duX2NiLFxuXHRcdH0pO1xuXG5cdFx0Ly8gVG9nZ2xlIEluYm94XG5cdFx0Y29uc3QgdG9nZ2xlX2luYm94X2NiID0gKCkgPT4ge1xuXHRcdFx0dG9nZ2xlX2luYm94KHRoaXMuYXBwKTtcblx0XHR9O1xuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogJ2V0aGFuOnRvZ2dsZS1pbmJveCcsXG5cdFx0XHRuYW1lOiAnVG9nZ2xlIGluYm94Jyxcblx0XHRcdGNhbGxiYWNrOiB0b2dnbGVfaW5ib3hfY2IsXG5cdFx0fSk7XG5cdH1cblxuXHRvbnVubG9hZCgpIHt9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsc0JBQW1GO0FBRW5GLElBQU0sdUJBQXVCO0FBRTdCLFNBQVMsZ0JBQWdCLEtBQVU7QUFFbEMsUUFBTSxRQUFRLElBQUksTUFBTSxpQkFBaUI7QUFFekMsTUFBSSxhQUFhLENBQUM7QUFDbEIsYUFBVyxRQUFRLE9BQU87QUFDekIsVUFBTSxLQUFLLElBQUksY0FBYyxhQUFhLElBQUk7QUFDOUMsUUFBSSxNQUFNLE1BQU07QUFDZjtBQUFBLElBQ0Q7QUFFQSxRQUFJLFdBQU8sNEJBQVcsRUFBRTtBQUN4QixRQUFJLFFBQVEsTUFBTTtBQUNqQjtBQUFBLElBQ0Q7QUFFQSxRQUFJLEtBQUssU0FBUyxRQUFRLEtBQ3RCLEtBQUssS0FBSyxPQUFPLFdBQVcsS0FBSyxJQUFJO0FBQ3hDLGlCQUFXLEtBQUssSUFBSTtBQUFBLElBQ3JCO0FBQUEsRUFDRDtBQUVBLGFBQVcsS0FBTSxDQUFDLEdBQUcsTUFBTSxFQUFFLEtBQUssUUFBUSxFQUFFLEtBQUssS0FBTTtBQUV2RCxNQUFJLFdBQVcsVUFBVSxHQUFHO0FBQzNCO0FBQUEsRUFDRDtBQUVBLE1BQUksUUFBUTtBQUNaLE1B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
