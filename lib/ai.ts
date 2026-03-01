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

export type BookSuggestion = {
  title: string;
  author: string;
  category?: string;
  publishedYear?: number;
  description: string;
};

export async function discoverNewBooks(
  query: string
): Promise<BookSuggestion[]> {
  checkAiAvailable();

  const currentYear = new Date().getFullYear();
  const prompt = `You are a library acquisition assistant. Based on this request: "${query}"

Suggest 3-5 real, recently published books (from ${currentYear - 2} to ${currentYear}) that would be great additions to a library.

For each book, provide:
- Title (exact title)
- Author (full name)
- Category/Genre
- Published Year
- Brief description (1-2 sentences)

Return ONLY valid JSON in this format:
[
  {
    "title": "Book Title",
    "author": "Author Name",
    "category": "Genre",
    "publishedYear": ${currentYear},
    "description": "Brief description"
  }
]

Focus on popular, well-reviewed books that libraries would want to acquire.`;

  const message = await anthropic!.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
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
    // Extract JSON from response (might be wrapped in markdown code blocks)
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : response;
    return JSON.parse(jsonStr);
  } catch {
    return [];
  }
}

export type PurchaseRecommendation = {
  title: string;
  author: string;
  category: string;
  publishedYear?: number;
  description: string;
  reason: string; // Why this book is recommended based on loan patterns
};

export async function recommendBooksToPurchase(
  popularBooks: Array<{ title: string; author: string; category: string; loanCount: number }>,
  existingCategories: string[]
): Promise<PurchaseRecommendation[]> {
  checkAiAvailable();

  const currentYear = new Date().getFullYear();
  const booksContext = popularBooks
    .slice(0, 10) // Top 10 most borrowed
    .map((b) => `- "${b.title}" by ${b.author} (${b.category}) - ${b.loanCount} loans`)
    .join("\n");

  const categoriesContext = existingCategories.join(", ");

  const prompt = `You are a library acquisition specialist analyzing borrowing patterns to recommend new books to purchase.

**Current Popular Books (Most Borrowed):**
${booksContext}

**Existing Categories:** ${categoriesContext}

Based on these borrowing patterns, recommend 5 NEW books (published ${currentYear - 3} to ${currentYear}) that this library should purchase to meet patron demand. These books should NOT be the ones listed above, but should appeal to readers who enjoyed them.

Consider:
- Popular genres/categories showing high demand
- Similar authors or themes to top borrowed books
- Recent releases that align with patron interests
- Books that would complement the existing collection

For each recommendation, provide:
- Title (exact, real book title)
- Author (full name)
- Category/Genre
- Published Year
- Description (1-2 sentences about the book)
- Reason (1 sentence explaining why this book fits the library's borrowing patterns)

Return ONLY valid JSON in this format:
[
  {
    "title": "Book Title",
    "author": "Author Name",
    "category": "Genre",
    "publishedYear": ${currentYear},
    "description": "Brief book description",
    "reason": "Why this book matches patron interests"
  }
]`;

  const message = await anthropic!.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
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
    // Extract JSON from response (might be wrapped in markdown code blocks)
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : response;
    return JSON.parse(jsonStr);
  } catch {
    return [];
  }
}
