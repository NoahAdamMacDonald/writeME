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
    const prompt = `
    Convert the following text into clean, structured Markdown.
    Use headings, lists, code blocks, and tables when appropriate.
    Do NOT add commentary or invent content.
    Preserve the meaning exactly.

    Text:
    ${text}
    `;

    const response = await fetch(this.workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`Worker error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('AI returned no content.');
    }

    return content;
  }
}
