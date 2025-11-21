// src/pages/creator/components/utils/txtToHtml.ts
export const txtToHtml = (text: string): string => {
  return text
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) return `<h1>${trimmed.slice(2)}</h1>`;
      if (trimmed.startsWith('## ')) return `<h2>${trimmed.slice(3)}</h2>`;
      if (trimmed.startsWith('### ')) return `<h3>${trimmed.slice(4)}</h3>`;
      if (trimmed.startsWith('- ')) return `<li>${trimmed.slice(2)}</li>`;
      if (/^\d+\.\s/.test(trimmed)) return `<li>${trimmed.replace(/^\d+\.\s/, '')}</li>`;
      if (trimmed === '') return '<br/>';
      if (trimmed.includes('💡')) return `<p style="color: #1d4ed8; font-weight: 500;">${trimmed}</p>`;
      return `<p>${trimmed}</p>`;
    })
    .join('')
    .replace(/(<li>.*?<\/li>)+/gs, match => `<ul>${match}</ul>`);
};