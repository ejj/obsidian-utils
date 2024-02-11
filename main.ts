import { Plugin, App} from 'obsidian';

function open_inbox_note(app: App, nextNoteSeq: number) {
	// const files = this.app.vault.getMarkdownFiles();
	const files = app.vault.getMarkdownFiles();

	let inboxFiles = [];
	for (const file of files) {
		let fileCache = app.metadataCache.getFileCache(file);
		let tags = fileCache?.tags?.map(tagCache => tagCache.tag) || [];
		let fmtags = fileCache?.frontmatter?.tags.map((t :string) => `#${t}`);
		tags.push(...fmtags || []);

		if (tags.includes("#inbox")
			&& file.path.search("Templates") == -1) {
			inboxFiles.push(file);
		}
	}

	inboxFiles.sort(((a, b) => a.stat.ctime - b.stat.ctime));

	if (inboxFiles.length == 0) {
		return;
	}

	let index = nextNoteSeq % inboxFiles.length
	app.workspace.openLinkText(inboxFiles[index].basename, '', false, {
		active: true,
	})
}

export default class EthanUtil extends Plugin {
	async onload() {
		// TODO make a Delete and Next Inbox Command, should just call your
		// existing commands.
		//
		let nextNoteSeq = 0;

		this.addCommand({
			id: 'ethan:inbox-next',
			name: 'Next Inbox Note',
			callback: () => {
				nextNoteSeq++;
				open_inbox_note(this.app, nextNoteSeq)
			},
		});

		this.addCommand({
			id: 'ethan:delete-inbox-next',
			name: 'Delete and Next Inbox Note',
			callback: () => {
				let file = this.app.workspace.getActiveFile();
				if (file != null) {
					this.app.vault.trash(file, false);
				}
				open_inbox_note(this.app, nextNoteSeq);
			}
		});
	}

	onunload() {}
}


