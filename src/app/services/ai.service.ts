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
    const systemPrompt = `
  You are a Markdown formatter for a Markdown-first editor.

  Follow these style rules strictly:

  GENERAL
  - Preserve the meaning, order, and tone of the text.
  - You may add headings ONLY when the text clearly implies a section.
  - Do NOT add commentary, explanations, meta-comments, or notes.
  - Do NOT rewrite, improve, or expand the text.
  - Do NOT create new sections that are not implied by the input.

  LISTS
  - Use "-" for bullet points (never "*", "+", or other markers).
  - Preserve list order and indentation.

  LINKS
  - Format links as [text](url).
  - If no link text is provided, use the URL as the text.

  CODE
  - Format code blocks using triple backticks.
  - Detect the language when obvious (python, javascript, json, bash).
  - Preserve ALL code exactly as written.
  - Do NOT add docstrings, comments, or improvements.
  - Do NOT rewrite pseudo-code into real code.

  JSON
  - Always pretty-print JSON with 2-space indentation.

  TABLES
  - Always use GitHub-style Markdown tables:
    | Column | Column |
    | :--- | :--- |
    | row | row |
  - Never use lists, bold text, or dashes to represent tables.

  Your job is to convert the user text into clean, structured Markdown using ONLY these rules.
  `;


    const userPrompt = `
  Convert the following text into clean, structured Markdown.
  You may add headings, lists, code blocks, and tables when appropriate,
  but do NOT add commentary or invent content.

  Text:
  ${text}
  `;

    const payload = {
      model: this.model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    };

    const response = await fetch(this.workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Worker error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('AI returned no content.');
    }

    return content.trim();
  }
}
