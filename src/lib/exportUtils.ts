import { jsPDF } from "jspdf";
import { Document, Paragraph, Packer, TextRun } from "docx";

export type ExportFormat = "txt" | "pdf" | "docx" | "md";

export const exportScenario = async (
  text: string,
  id: string,
  format: ExportFormat
) => {
  switch (format) {
    case "txt":
      downloadTextFile(text, id);
      break;
    case "pdf":
      await downloadPDF(text, id);
      break;
    case "docx":
      await downloadDOCX(text, id);
      break;
    case "md":
      downloadMarkdown(text, id);
      break;
  }
};

const downloadTextFile = (text: string, id: string) => {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  downloadBlob(blob, `scenario-${id}.txt`);
};

const downloadPDF = async (text: string, id: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const maxWidth = pageWidth - margin * 2;
  
  // Разбиваем текст на строки с учетом ширины страницы
  const lines = doc.splitTextToSize(text, maxWidth);
  
  let y = margin;
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.getHeight();
  
  lines.forEach((line: string) => {
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  });
  
  doc.save(`scenario-${id}.pdf`);
};

const downloadDOCX = async (text: string, id: string) => {
  const paragraphs = text.split("\n").map(
    (line) =>
      new Paragraph({
        children: [new TextRun(line)],
        spacing: {
          after: 200,
        },
      })
  );

  const doc = new Document({
    sections: [
      {
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `scenario-${id}.docx`);
};

const downloadMarkdown = (text: string, id: string) => {
  // Добавляем базовое форматирование Markdown
  const markdownText = `# Сценарий

${text}

---
*Создано: ${new Date().toLocaleDateString("ru-RU")}*
`;
  
  const blob = new Blob([markdownText], { type: "text/markdown;charset=utf-8" });
  downloadBlob(blob, `scenario-${id}.md`);
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
