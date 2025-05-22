import { ChromaClient, Collection, IncludeEnum } from 'chromadb';
import { IReadableGmailFormat } from './format';

// Running in docker at port 8000
const chromaClient = new ChromaClient({ path: 'http://localhost:8000' });

let collection: Collection | null = null;
let embedder: any = null;

export const getEmbedder = async () => {
  if (!embedder) {
    const { pipeline } = await import('@xenova/transformers');
    console.log('Loading embedding pipeline...');

    // The feature-extraction pipeline is used to convert text into vector embeddings.
    embedder = await pipeline('feature-extraction');
    console.log('Embedding pipeline loaded.');
  }
  return embedder;
};

export const getCollection = async () => {
  if (!collection) {
    try {
      collection = await chromaClient.getOrCreateCollection({ name: 'emails' });
      console.log('Connected to ChromaDB and got collection.');
    } catch (err) {
      console.error('Failed to connect to ChromaDB:', err);
      throw err;
    }
  }
  return collection;
};

export const indexEmails = async (emails: IReadableGmailFormat[]) => {
  const embedder = await getEmbedder();
  const collection = await getCollection();

  for (const email of emails) {
    const text = `${email.subject} ${email.snippet}`;
    let embedding;
    let embeddingArray;

    try {
      embedding = await getEmbedingFromText(text);
      embeddingArray = embedding.data;
    } catch (err) {
      console.error('Failed to embed email:', email.id, err);
      // skip to not add to collection if failed
      continue;
    }
    try {
      await collection.add({
        ids: [email.id],
        embeddings: [embeddingArray],
        metadatas: [email as any],
        documents: [text],
      });
    } catch (err) {
      console.error('Failed to add email to collection:', email.id, err);
    }
  }
};

export const vectorSearchEmails = async (query: string, k = 5) => {
  const collection = await getCollection();
  let embedding = await getEmbedingFromText(query);
  let results;
  try {
    results = await collection.query({
      queryEmbeddings: [embedding.data],
      nResults: k,
      include: [IncludeEnum.Metadatas, IncludeEnum.Documents],
    });
  } catch (err) {
    console.error('Failed to query collection:', err);
    throw err;
  }
  return results;
};

const getEmbedingFromText = async (text: string) => {
  let embedding;
  const embedder = await getEmbedder();
  try {
    embedding = await embedder(text, { pooling: 'mean', normalize: true });
    return embedding;
  } catch (err) {
    throw err;
  }
};
