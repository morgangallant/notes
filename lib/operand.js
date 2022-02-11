const endpoint = "https://api.operand.ai";

// Creates a document set for a new user.
export async function createDocumentSetForUser(email) {
  let response = await fetch(endpoint + "/v1/sets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: process.env.OPERAND_API_KEY,
    },
    body: JSON.stringify({
      name: email,
      description: "Notes User",
    }),
  });
  return await response.json();
}

// Create a new document within a document set.
export async function createDocument(set, title, url) {
  let response = await fetch(endpoint + "/v1/documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: process.env.OPERAND_API_KEY,
    },
    body: JSON.stringify({
      set: set,
      tags: [],
      properties: {
        title: title,
        url: url,
        lang: "en",
      },
      type: "text",
      content: "",
    }),
  });
  return await response.json();
}

// Update an existing document within a document set.
export async function updateDocument(id, title, url, contents) {
  let response = await fetch(endpoint + "/v1/documents/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: process.env.OPERAND_API_KEY,
    },
    body: JSON.stringify({
      tags: [],
      properties: {
        title: title,
        url: url,
        lang: "en",
      },
      type: "text",
      content: contents,
    }),
  });
  return await response.json();
}

// Delete an existing document within a document set.
export async function deleteDocument(id) {
  let response = await fetch(endpoint + "/v1/documents/" + id, {
    method: "DELETE",
    headers: {
      Authorization: process.env.OPERAND_API_KEY,
    },
  });
  return await response.json();
}

// Search over an existing document set.
export async function search(set, query, docs, snippets) {
  let response = await fetch(endpoint + "/v1/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: process.env.OPERAND_API_KEY,
    },
    // "d64a8839-c5a2-45ff-89bb-757b4c0077fc" - pg's
    body: JSON.stringify({
      sets: [set],
      query: query,
      options: {
        documents: docs,
        snippets: snippets,
      },
    }),
  });
  return await response.json();
}
