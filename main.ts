import { Plugin, App} from 'obsidian';

const UNIQUE_NOTE_TEMPLATE = "Unique Note Inbox Template";

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

async function unique_note(app: App) {
	let name = Math.trunc(new Date().getTime()/1000).toString().substring(3);

	const file = app.vault.getMarkdownFiles().find(
		f => f.basename == UNIQUE_NOTE_TEMPLATE);

	if (file == null) {
		console.log("Can't find: ", UNIQUE_NOTE_TEMPLATE);
		return null;
	}

	let contents = await app.vault.cachedRead(file);
	let currentDate = new Date().toISOString().slice(0, 10);
	contents = contents.replace(/{{date}}/g, currentDate);

	let newFile = await app.vault.create(`${name}.md`, contents);
	await app.workspace.openLinkText(newFile.basename, "", false, {
		active: true,
	});
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

		this.addCommand({
			id: 'ethan:unique-note',
			name: 'Ethan Unique Note',
			callback: () => {
				unique_note(this.app);
			}
		});

		this.addCommand({
			id: 'ethan:unique-task',
			name: 'Ethan Unique Task',
			callback: async () => {
				await unique_note(this.app);
				(this.app as any).commands.
					executeCommandById("obsidian-tasks-plugin:edit-task");
			}
		});
	}

	onunload() {}
}
