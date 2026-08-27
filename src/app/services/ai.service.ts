import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private workerUrl = environment.workerUrl;
  private model = environment.groqModel;

  async formatToMarkdown(text: string): Promise<string> {
    const systemPrompt = await this.loadPrompt("assets/prompts/system.md");
    const userPrompt = await this.loadPrompt("assets/prompts/user.md");

    const input = `${systemPrompt}\n\n${userPrompt.replace('{{TEXT}}', text)}`;

    const payload = {
      model: this.model,
      temperature: 0,
      input,
      max_output_tokens: 2048
    };

    const response = await fetch(this.workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Worker error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

const content =data?.output?.find((o: { type: string; }) => o.type === "message")?.content?.find((c: { type: string; }) => c.type === "output_text")?.text;

    if (!content) {
      throw new Error('AI returned no content.');
    }

    return content.trim();
  }

  private async loadPrompt(path: string): Promise<string> {
    const res = await fetch(path);
    return res.text();
  }
}
