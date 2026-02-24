import Anthropic from "@anthropic-ai/sdk";

// Check if API key is configured
const hasValidApiKey =
  process.env.AI_API_KEY && process.env.AI_API_KEY.startsWith("sk-ant-");

const anthropic = hasValidApiKey
  ? new Anthropic({
      apiKey: process.env.AI_API_KEY!,
    })
  : null;

function checkAiAvailable() {
  if (!anthropic) {
    throw new Error(
      "AI features are not configured. Please add a valid Anthropic API key to your .env file (AI_API_KEY=sk-ant-...)"
    );
  }
}

export async function generateBookDescription(
  title: string,
  author: string,
  category?: string,
  year?: number
): Promise<string> {
  checkAiAvailable();

  const prompt = `Generate a concise, engaging book description (2-3 sentences) for:
Title: ${title}
Author: ${author}
${category ? `Category: ${category}` : ""}
${year ? `Published: ${year}` : ""}

Write a professional description that would appear on a library catalog.`;

  const message = await anthropic!.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const textContent = message.content.find((c) => c.type === "text");
  return textContent && "text" in textContent ? textContent.text : "";
}

export async function searchBooksWithAI(
  query: string,
  availableCategories: string[]
): Promise<{
  searchTerms: string[];
  category?: string;
  yearRange?: { min?: number; max?: number };
}> {
  checkAiAvailable();

  const prompt = `Given this natural language book search query: "${query}"

Extract structured search parameters:
1. Key search terms for title/author
2. Category if mentioned (must be from: ${availableCategories.join(", ")})
3. Year range if mentioned

Respond ONLY with valid JSON in this format:
{
  "searchTerms": ["term1", "term2"],
  "category": "category or null",
  "yearRange": { "min": year or null, "max": year or null }
}`;

  const message = await anthropic!.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const textContent = message.content.find((c) => c.type === "text");
  const response =
    textContent && "text" in textContent ? textContent.text : "{}";

  try {
    const parsed = JSON.parse(response);
    return {
      searchTerms: parsed.searchTerms || [],
      category: parsed.category || undefined,
      yearRange: parsed.yearRange || undefined,
    };
  } catch {
    return { searchTerms: [query] };
  }
}

export async function recommendSimilarBooks(
  bookTitle: string,
  bookAuthor: string,
  availableBooks: Array<{ title: string; author: string; category?: string }>
): Promise<string[]> {
  checkAiAvailable();

  const booksContext = availableBooks
    .map(
      (b) =>
        `- "${b.title}" by ${b.author}${b.category ? ` (${b.category})` : ""}`
    )
    .join("\n");

  const prompt = `Given the book "${bookTitle}" by ${bookAuthor}, recommend up to 3 similar books from this catalog:

${booksContext}

Return ONLY a JSON array of book titles, e.g.: ["Title 1", "Title 2", "Title 3"]`;

  const message = await anthropic!.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const textContent = message.content.find((c) => c.type === "text");
  const response =
    textContent && "text" in textContent ? textContent.text : "[]";

  try {
    return JSON.parse(response);
  } catch {
    return [];
  }
}
