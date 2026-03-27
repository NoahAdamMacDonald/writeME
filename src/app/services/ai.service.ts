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
    const systemPrompt = await this.loadPrompt("assets/prompts/system.md");
    const userPrompt = await this.loadPrompt("assets/prompts/user.md");

    const payload = {
      model: this.model,
      temperature: 0,
      stream: false,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt.replace('{{TEXT}}', text) },
      ],
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
    const content = data?.choices?.[0]?.message?.content;

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
