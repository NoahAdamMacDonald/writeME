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

Follow these rules strictly:

GENERAL
- Preserve the meaning, order, and tone of the text exactly.
- You may add headings ONLY when the text clearly implies a section.
- Do NOT invent section names.
- Do NOT reorganize content into new categories.
- Do NOT add commentary, explanations, opinions, meta-comments, or notes.
- Do NOT say anything like "Note:", "However", "Alternatively", "Here is", "I added".
- Do NOT correct, improve, rewrite, or expand the text.

LISTS
- Use "-" for bullet points.
- Preserve list order and indentation.

LINKS
- Format links as [text](url).
- If no link text is provided, use the URL as the text.

CODE
- Format code blocks using triple backticks.
- Detect the language when obvious.
- Preserve ALL code exactly as written.
- Do NOT add docstrings, comments, or improvements.
- Do NOT convert pseudo-code into real code.
- Do NOT add extra code blocks.

JSON
- Pretty-print JSON with 2-space indentation.

TABLES
- When the text implies a table, output exactly ONE table.
- The table MUST use GitHub-style Markdown.
- The header row MUST come first.
- The alignment row MUST come second.
- The alignment row MUST use colons, like:
  | :--- | :--- | :--- |
- Every data row MUST come after the alignment row.
- Every row MUST begin and end with a pipe.
- Do NOT use compact tables like "a | b | c".
- Do NOT reorder rows.
- Do NOT add headings, labels, or commentary before or after the table.



OUTPUT RULES
- Output ONLY the final formatted Markdown.
- Do NOT explain anything.
- Do NOT describe what you did.
- Do NOT add notes or commentary.

Your job is to convert the user text into clean, structured Markdown using ONLY these rules.
`;

    const userPrompt = `
Convert the following text into clean, structured Markdown.

Return ONLY the converted Markdown. Do not explain anything. Do not add notes.

Text:
${text}
`;

    const payload = {
      model: this.model,
      temperature: 0,
      stream: false,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
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
}
