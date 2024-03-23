import { Plugin, App, MarkdownView, Notice, getAllTags, parseFrontMatterTags, TFolder, TFile} from 'obsidian';

const UNIQUE_NOTE_TEMPLATE = "Unique Note Inbox Template";
const UNIQUE_NOTE_PATH =
    "00-09 💾 System/02 Obsidian/02.00 Notes";
const INBOX_PATH = "70-79 Productivity/70 System/70.01 📥 Inbox";
const TASKS_PATH = "70-79 Productivity/70 System/70.02 Tasks/Floating Tasks.md";

function open_inbox_note(app: App) {
    const files = app.vault.getMarkdownFiles();

    let inboxFiles = [];
    for (const file of files) {
        const mc = app.metadataCache.getFileCache(file);
        if (mc == null) {
            continue;
        }

        let tags = getAllTags(mc);
        if (tags == null) {
            continue;
        }

        if (tags.includes("#inbox")
            && file.path.search("Templates") == -1) {
            inboxFiles.push(file);
        }
    }

    let folder = app.vault.getAbstractFileByPath(INBOX_PATH);
    if (folder instanceof TFolder) {
        for (const f of folder.children) {
            if (f instanceof TFile) {
                inboxFiles.push(f);
            }
        }
    }

    inboxFiles.sort(((a, b) => b.stat.ctime - a.stat.ctime));

    if (inboxFiles.length == 0) {
        return;
    }

    let index = 0;
    let activeFile = this.app.workspace.getActiveFile();
    if (activeFile !== null) {
        index = inboxFiles.findIndex(obj => obj == activeFile); // We want the next file.
        if (index < 0) {
            index = -1;
        }
        index = (index + 1) % inboxFiles.length;
    }

    app.workspace.getLeaf().openFile(inboxFiles[index]);
}

async function unique_note(app: App) {
    const file = app.vault.getMarkdownFiles().find(
        f => f.basename == UNIQUE_NOTE_TEMPLATE);

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

    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (view == null) {
        return
    }
    view.editor.focus();
}

async function copy_markdown(app: App) {
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
    new Notice(contents);
}

function toggle_inbox(app: App) {
    let file = app.workspace.getActiveFile();
    if (file == null) {
        return;
    }

    app.fileManager.processFrontMatter(file, (fm: any) => {
        let tags = parseFrontMatterTags(fm);

        if (tags == null) {
            tags = ["#inbox"];
        } else if (!tags.includes("#inbox")) {
            tags.push("#inbox");
        } else {
            tags = tags.filter((x :string) => x !== "#inbox");
        }
        fm.tags = tags;
        return fm;
    });
}

function append_task(app: App) {
    const editor = app.workspace.getActiveViewOfType(MarkdownView)?.editor;
    if (editor == null) {
        return
    }

    const cursor = editor.getCursor();
    const lineContent = editor.getLine(cursor.line);

    editor.replaceRange("",
                        { line: cursor.line, ch: 0 },
                        { line: cursor.line + 1, ch: 0 });

    const file = app.vault.getAbstractFileByPath(TASKS_PATH);
    if (file instanceof TFile) {
        this.app.vault.append(file, "\n" + lineContent);
    }
}

export default class EthanUtil extends Plugin {
    async onload() {
        // Inbox Next
        const inbox_next_cb =  () => {
            open_inbox_note(this.app);
        };

        this.addCommand({
            id: 'ethan:inbox-next',
            name: 'Next inbox',
            callback: inbox_next_cb,
        });
        this.addRibbonIcon("mails", "Next Inbox", inbox_next_cb);


        // Delete and Inbox Next
        const delete_inbox_cb = () => {
            let file = this.app.workspace.getActiveFile();
            open_inbox_note(this.app);
            if (file !== null) {
                this.app.vault.trash(file, false);
            }
        };

        this.addCommand({
            id: 'ethan:delete-inbox-next',
            name: 'Delete',
            callback: delete_inbox_cb,
        });
        this.addRibbonIcon("trash", "Delete, Open Inbox", delete_inbox_cb);


        // Unique Note
        const new_note_cb = () => {
            unique_note(this.app);
        };
        this.addCommand({
            id: 'ethan:unique-note',
            name: 'New note',
            callback: new_note_cb,
        });

        this.addRibbonIcon("file-plus-2", "Create Unique note", new_note_cb);

        // Copy Markdown
        const copy_markdown_cb = () => {
            copy_markdown(this.app);
        };
        this.addCommand({
            id: 'ethan:copy-markdown',
            name: 'Copy markdown',
            callback: copy_markdown_cb,
        });

        // Toggle Inbox
        const toggle_inbox_cb = () => {
            toggle_inbox(this.app);
        };
        this.addCommand({
            id: 'ethan:toggle-inbox',
            name: 'Toggle inbox',
            callback: toggle_inbox_cb,
        });

        const append_task_cb = () => {
            append_task(this.app);
        };
        this.addCommand({
            id: 'ethan:append-task',
            name: 'Append Task',
            callback: append_task_cb,
        });
    }

    onunload() {}
}
