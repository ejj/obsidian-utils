import { Plugin, App} from 'obsidian';

function open_inbox_note(app: App) {
	// const files = this.app.vault.getMarkdownFiles();
	const files = app.vault.getMarkdownFiles();

	let inboxFiles = [];
	for (const file of files) {
		let fileCache = app.metadataCache.getFileCache(file);
		let tags = fileCache?.tags?.map(tagCache => tagCache.tag) || [];
		let fmtags = fileCache?.frontmatter?.tags?.map((t :string) => `#${t}`);
		tags.push(...fmtags || []);

		if (tags.includes("#inbox")
			&& file.path.search("Templates") == -1) {
			inboxFiles.push(file);
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

	app.workspace.openLinkText(inboxFiles[index].basename, '', false, {
		active: true,
	})
}

export default class EthanUtil extends Plugin {
	async onload() {
		this.addCommand({
			id: 'ethan:inbox-next',
			name: 'Next Inbox Note',
			callback: () => {
				open_inbox_note(this.app);
			},
		});

		this.addCommand({
			id: 'ethan:delete-inbox-next',
			name: 'Delete and Next Inbox Note',
			callback: () => {
				let file = this.app.workspace.getActiveFile();
				open_inbox_note(this.app);
				if (file !== null) {
					this.app.vault.trash(file, false);
				}
			}
		});
	}

	onunload() {}
}


