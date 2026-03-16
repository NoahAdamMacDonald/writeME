import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private workerUrl = environment.workerUrl;
  private model = environment.groqModel;

  setModel(model: string) {
    this.model = model;
  }

  async formatToMarkdown(text: string): Promise<string> {
    const response = await fetch(this.workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: `
You are a Markdown formatter for a Markdown-first editor.
Follow these style rules strictly:

- Use "-" for bullet points (never "*", "+", or other markers).
- Format links as [text](url). If no link text is provided, use the URL as the text.
- Format code blocks using triple backticks and the correct language when obvious.
- Format tables using standard Markdown table syntax.
- Keep heading levels minimal (H1 or H2 unless the text clearly implies deeper structure).
- Do not rewrite sentences; only format them.
- Do not add sections that are not implied by the text.
- Do not add commentary or explanations.
- Preserve the meaning and order exactly.
          `,
          },
          {
            role: 'user',
            content: `
Convert the following text into clean, structured Markdown.
You may add headings, lists, code blocks, and tables when appropriate,
but do NOT add commentary or invent content.

Text:
${text}
          `,
          },
        ],
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error('AI returned no content.');
    return content;
  }
}
