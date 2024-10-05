import { Plugin, App, MarkdownView, Notice, getAllTags, parseFrontMatterTags, TFolder, TFile } from 'obsidian';

const BASIC_TEMPLATE = "Basic Template";
const INBOX_PATH = "📥 Inbox";
const TASKS_PATH = "Tasks.md";

function currentDate() {
	return new Date().toISOString().slice(0, 10);
}

export default class EthanUtil extends Plugin {
	async unique_note_contents() {
		const file = this.app.vault.getMarkdownFiles().find(
			f => f.basename == BASIC_TEMPLATE);

		if (file == null) {
			throw new Error("Can't find: " + BASIC_TEMPLATE);
		}

		let contents = await this.app.vault.cachedRead(file);
		contents = contents.replace(/{{date}}/g, currentDate());

		return contents
	}

	async on_create(file: TFile) {
		const new_contents = await this.unique_note_contents();

		// This is a bit of a hack to resolve an issue on mobile.  When you
		// share to obsidian and create a new file, obsidian will create the file
		// and then use modify to replace its contents.  If we run
		// concurrently, we could read the empty contents of the file, and then
		// overwrite whatever they did.   To resolve this, we read our template,
		// and then sleep for 10ms.  That gives just enough buffer to ensure that
		// we're not clobbering the share.
		await new Promise(resolve => setTimeout(resolve, 10));

		const old_content = await this.app.vault.read(file);

		// If it starts with frontmatter, don't add our template
		if (/^---/.test(old_content)) {
			return
		}

		this.app.vault.modify(file, new_contents + old_content)
	}

	async create_task() {
		const plugin = this.app.plugins.plugins['obsidian-tasks-plugin']
		const task = await plugin.apiV1.createTaskLineModal();
		const file = this.app.vault.getAbstractFileByPath(TASKS_PATH);

		if (file instanceof TFile) {
			this.app.vault.append(file, "\n" + task);
		} else {
			console.log("failed to find file for create_task")
		}
	}

	async append_task() {
		const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
		if (editor == null) {
			return
		}

		const cursor = editor.getCursor();
		const lineContent = editor.getLine(cursor.line);

		editor.replaceRange("",
			{ line: cursor.line, ch: 0 },
			{ line: cursor.line + 1, ch: 0 });

		const file = this.app.vault.getAbstractFileByPath(TASKS_PATH);
		if (file instanceof TFile) {
			await this.app.vault.append(file, "\n" + lineContent);
		}
	}

	toggle_inbox() {
		let file = this.app.workspace.getActiveFile();
		if (file == null) {
			return;
		}

		this.app.fileManager.processFrontMatter(file, (fm: any) => {
			let tags = parseFrontMatterTags(fm);

			if (tags == null) {
				tags = ["#inbox"];
			} else if (!tags.includes("#inbox")) {
				tags.push("#inbox");
			} else {
				tags = tags.filter((x: string) => x !== "#inbox");
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
		new Notice(contents);
	}

	open_inbox_note() {
		const files = this.app.vault.getMarkdownFiles();

		let inboxFiles = [];
		for (const file of files) {
			const mc = this.app.metadataCache.getFileCache(file);
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

		let folder = this.app.vault.getAbstractFileByPath(INBOX_PATH);
		if (folder instanceof TFolder) {
			console.log("here 1")
			for (const f of folder.children) {
				if (f instanceof TFile) {
					inboxFiles.push(f);
				}
			}
		} else {
			console.log("here")
		}

		inboxFiles.sort((a, b) => {
			// Check if files are markdown
			const aIsMarkdown = a.extension === 'md';
			const bIsMarkdown = b.extension === 'md';

			// If one is markdown and the other isn't, prioritize markdown
			if (aIsMarkdown && !bIsMarkdown) return -1;
			if (!aIsMarkdown && bIsMarkdown) return 1;

			// If both are markdown or both are not, sort by creation time
			return b.stat.ctime - a.stat.ctime;
		});

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

		this.app.workspace.getLeaf().openFile(inboxFiles[index]);
	}

	async unique_note() {
		const file = this.app.vault.getMarkdownFiles().find(
			f => f.basename == BASIC_TEMPLATE);

		if (file == null) {
			console.log("Can't find: ", BASIC_TEMPLATE);
			return null;
		}

		let stamp = Math.random().toString(36).substring(9).toUpperCase();
		let name = `${currentDate()} ${stamp}.md`;
		let contents = await this.unique_note_contents();
		let newFile = await this.app.vault.create(name, contents);
		await this.app.workspace.getLeaf().openFile(newFile);

		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (view == null) {
			return
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
		// Icon Names come from: https://lucide.dev/
		const inbox_next_cb = () => this.open_inbox_note()
		this.addCommand({
			id: 'ethan:inbox-next',
			name: 'Next inbox',
			callback: inbox_next_cb,
		});
		this.addRibbonIcon("mails", "Next", inbox_next_cb);

		const new_note_cb = () => this.unique_note()
		this.addCommand({
			id: 'ethan:unique-note',
			name: 'New note',
			callback: new_note_cb,
		});
		this.addRibbonIcon("file-plus-2", "Create", new_note_cb);

		const delete_inbox_cb = () => this.delete_inbox()
		this.addCommand({
			id: 'ethan:delete-inbox-next',
			name: 'Delete',
			callback: delete_inbox_cb,
		});
		this.addRibbonIcon("trash", "Delete", delete_inbox_cb);

		const copy_markdown_cb = () => this.copy_markdown()
		this.addCommand({
			id: 'ethan:copy-markdown',
			name: 'Copy markdown',
			callback: copy_markdown_cb,
		});
		this.addRibbonIcon("clipboard-copy", "Copy", copy_markdown_cb);

		this.addCommand({
			id: 'ethan:toggle-inbox',
			name: 'Toggle inbox',
			callback: () => this.toggle_inbox()
		});

		this.addCommand({
			id: 'ethan:append-task',
			name: 'Append Task',
			callback: () => this.append_task()
		});

		this.addCommand({
			id: 'ethan:create-task',
			name: 'Create Task',
			callback: () => this.create_task()
		});

		this.app.workspace.onLayoutReady(() => {
			this.registerEvent(this.app.vault.on('create', this.on_create, this));
		});

	}

	onunload() { }
}
