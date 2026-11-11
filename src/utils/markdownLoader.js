// Carga automática en tiempo de compilación/desarrollo de todos los archivos .md en src/content/apuntes/
const rawMarkdownFiles = import.meta.glob('../content/apuntes/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export const parseFrontmatter = (rawText = '') => {
  const normalized = rawText.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    return { metadata: {}, body: normalized.trim() };
  }

  const endIdx = normalized.indexOf('\n---\n', 4);
  if (endIdx === -1) {
    return { metadata: {}, body: normalized.trim() };
  }

  const yamlBlock = normalized.slice(4, endIdx);
  const body = normalized.slice(endIdx + 5).trim();
  const metadata = {};

  yamlBlock.split('\n').forEach((line) => {
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      metadata[key] = val;
    }
  });

  return { metadata, body };
};

export const loadRepoMarkdownNotesBySubject = () => {
  const byCode = {};

  Object.entries(rawMarkdownFiles).forEach(([filePath, rawContent]) => {
    const fileName = filePath.split('/').pop() || 'apunte.md';
    if (fileName.toUpperCase().startsWith('README')) return;

    const { metadata, body } = parseFrontmatter(rawContent);
    const codeFromMeta = Number(metadata.subjectCode);
    const codeFromFilename = Number((fileName.match(/^(\d+)/) || [])[1]);
    const subjectCode = codeFromMeta || codeFromFilename;

    if (!subjectCode) return;

    if (!byCode[subjectCode]) byCode[subjectCode] = [];

    byCode[subjectCode].push({
      _id: `repo-md:${fileName}`,
      fileName,
      title: metadata.title || fileName.replace(/\.md$/i, ''),
      content: body,
      tags: metadata.tags || 'Markdown Repo',
      updatedAt: metadata.date || 'En repositorio',
      source: 'repo-md',
    });
  });

  return byCode;
};

const slugify = (str = '') =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const downloadNoteAsMarkdown = (subject, note) => {
  const dateStr = (note.updatedAt || new Date().toISOString()).slice(0, 10);
  const codePad = String(subject.code).padStart(2, '0');
  const fileName = `${codePad}-${slugify(note.title || subject.name)}.md`;

  const mdContent = [
    '---',
    `subjectCode: ${subject.code}`,
    `title: ${note.title}`,
    `date: ${dateStr}`,
    `tags: ${note.tags || subject.category}`,
    '---',
    '',
    note.content,
    '',
  ].join('\n');

  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};
