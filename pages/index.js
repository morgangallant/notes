import * as React from "react";
import Head from "next/head";
import Image from "next/image";
import { authorizeWebRequest } from "../lib/auth";
import cookieCutter from "cookie-cutter";
import superjson from "superjson";

// We fetch the user's data from the database server-side.
export async function getServerSideProps(context) {
  const user = await authorizeWebRequest(context.req);
  const stringified = superjson.stringify(user);
  const parsed = JSON.parse(stringified);
  return {
    props: {
      user: parsed.json,
    },
  };
}

// The login page which allows the user to login.
function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const login = async () => {
    let token = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    let response = await token.json();
    if (response.error) {
      console.warn(err);
      return;
    }
    cookieCutter.set("token", response.token);
  };
  return (
    <div className="flex h-screen">
      <div className="m-auto">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="max-w-md w-full space-y-6">
              <div>
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                  Operand Notes
                </h2>
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                    <label htmlFor="email-address" className="sr-only">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-sm focus:outline-none focus:z-10 sm:text-sm"
                      placeholder="john@doe.com"
                      autoComplete="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                    <label htmlFor="password" className="sr-only">
                      Password
                    </label>
                    <input
                      id="token"
                      name="token"
                      type="password"
                      autoComplete="off"
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-sm focus:outline-none  focus:z-10 sm:text-sm"
                      placeholder="secretpassword123"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <button
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    onClick={() => login()}
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// A single note, takes a note object and a delete function.
function Note({ note, setDiscover, updateNote, deleteNote }) {
  const [content, setContent] = React.useState(note.content);

  // As the user types, set the discovery.
  React.useEffect(() => {
    if (content == note.content) {
      setDiscover("");
      return;
    }
    const delayed = setTimeout(() => {
      let split = content.split(/[!?,.]/);
      if (split.length == 0) {
        return;
      }
      let discover = split[split.length - 1];
      if (split.length >= 2) {
        discover = split[split.length - 2] + " " + discover;
      }
      setDiscover(discover);
    }, 250);
    return () => clearTimeout(delayed);
  }, [content]);

  return (
    <>
      <div className="flex">
        <div className="flex items-center justify-between flex-grow">
          <strong>{note.title}</strong>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            className="flex items-center justify-center p-2 border border-transparent text-sm font-medium rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2"
            type="button"
            onClick={() => deleteNote()}
          >
            Delete
          </button>
        </div>
      </div>
      <div className="flex mt-4 flex-col">
        <div className="flex-grow">
          <textarea
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:z-10 sm:text-sm"
            placeholder="Enter your note here"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        {content != note.content && (
          <div className="flex-shrink-0 flex items-center justify-center mt-2">
            <button
              className="flex items-center justify-center p-2 border border-transparent text-sm font-medium rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2"
              type="button"
              onClick={() => updateNote(content)}
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// The notes page, which shows the user's notes.
function NotesPage() {
  const [notes, setNotes] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [title, setTitle] = React.useState("");
  const [discoveryQuery, setDiscoveryQuery] = React.useState(null);
  const [discoveryResults, setDiscoveryResults] = React.useState(null);

  // When the page loads, fetch the notes.
  React.useEffect(() => {
    const f = async () => {
      let response = await fetch("/api/note", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: cookieCutter.get("token"),
        },
      });
      let json = await response.json();
      setNotes(json.notes);
      setLoading(false);
    };
    f();
  }, []);

  // Whenever we update the discovery query, run discovery.
  React.useEffect(() => {
    const f = async () => {
      let response = await fetch(
        `/api/search?query=${encodeURIComponent(
          discoveryQuery.query
        )}&documents=5&snippets=3`,
        {
          method: "GET",
          headers: {
            Authorization: cookieCutter.get("token"),
          },
        }
      );
      let json = await response.json();
      setDiscoveryResults(json.results);
    };
    if (discoveryQuery) {
      f();
    } else {
      setDiscoveryResults(null);
    }
  }, [discoveryQuery]);

  // A utility function to create a new note.
  const createNote = async () => {
    let response = await fetch("/api/note", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: cookieCutter.get("token"),
      },
      body: JSON.stringify({
        title,
      }),
    });
    let json = await response.json();
    setNotes((notes) => [json.note, ...notes]);
    setTitle("");
  };

  // A utility function to update a note.
  const updateNote = async (id, content) => {
    let response = await fetch(`/api/note?id=${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: cookieCutter.get("token"),
      },
      body: JSON.stringify({
        content,
      }),
    });
    let json = await response.json();
    setNotes((notes) =>
      notes.map((note) => (note.id === id ? json.note : note))
    );
  };

  // A utility function to delete a note.
  const deleteNote = async (id) => {
    await fetch(`/api/note?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        Authorization: cookieCutter.get("token"),
      },
    });
    setNotes((notes) => notes.filter((note) => note.id !== id));
  };

  // If we're currently loading, show a loading indicator.
  if (loading) {
    return <p>Loading...</p>;
  }

  // Render the notes editor.
  const notesEditorContent = (
    <>
      <ul role="list" className="space-y-6 w-full">
        <li className="bg-white shadow overflow-hidden px-4 py-4 sm:px-6 sm:rounded-md">
          <div className="flex">
            <div className="flex-grow">
              <input
                type="text"
                className="appearance-none w-full bg-white border border-gray-300 rounded-lg py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                className="flex items-center justify-center p-2 border border-transparent text-sm font-medium rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2"
                type="button"
                onClick={() => createNote()}
              >
                Create New Note
              </button>
            </div>
          </div>
        </li>
        {notes.map((note) => (
          <li
            className="bg-white shadow overflow-hidden px-4 py-4 sm:px-6 sm:rounded-md"
            key={note.id}
          >
            <Note
              note={note}
              setDiscover={(query) => {
                if (query != "") {
                  setDiscoveryQuery({ note: note.id, query: query });
                } else {
                  setDiscoveryQuery(null);
                }
              }}
              updateNote={(content) => updateNote(note.id, content)}
              deleteNote={() => deleteNote(note.id)}
            />
          </li>
        ))}
      </ul>
    </>
  );

  // Extract a set of snippets from discovery results.
  const extractRelevantSnippets = (results, want, ignoreNoteID) => {
    let rel = [];
    let j = 0;
    while (rel.length < want) {
      let hit = false;
      for (let i = 0; i < results.length; i++) {
        let result = results[i];
        if (result.properties.url.includes(ignoreNoteID)) {
          continue;
        }
        let snippet = result.snippets[j];
        if (snippet && rel.length < want) {
          rel.push({
            content: snippet,
            title: result.properties.title,
            url: result.properties.url,
          });
          hit = true;
        }
      }
      j++;
      if (!hit) {
        break;
      }
    }
    return rel;
  };

  // Render the discovery results.
  const discoveryResultsContent = () => {
    let snippets = extractRelevantSnippets(
      discoveryResults,
      3,
      discoveryQuery.note
    );
    return (
      <div className="bg-white shadow overflow-hidden rounded-md max-w-md">
        {/* Title */}
        <div className="px-4 py-5 sm:px-6 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Discovery
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-gray-500">
            Some interesting, possibly relevant information!
          </p>
        </div>
        <hr />
        <ul role="list" className="divide-y divide-gray-200">
          {snippets.map((snippet) => (
            <li className="py-4 px-4">
              <p className="mt-2 text-sm leading-5">{snippet.content}</p>
              {/* Source */}
              <div className="mt-2 flex items-center text-sm leading-5 text-gray-500">
                <p className="flex-shrink-0">
                  <a
                    href={snippet.url}
                    className="focus:outline-none focus:underline"
                  >
                    Source: {snippet.title}
                  </a>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // We show the notes editor as the primary content of the screen,
  // and the discovery results as a sidebar.
  return (
    <div className="max-w-6xl mx-auto mt-8">
      <div className="flex">
        <div className="flex-grow">{notesEditorContent}</div>
        {discoveryResults && discoveryResults.length != 0 && discoveryQuery && (
          <div className="flex-shrink-0 ml-6">{discoveryResultsContent()}</div>
        )}
      </div>
    </div>
  );
}

export default function Index({ user }) {
  return (
    <>
      <Head>
        <title>Operand Notes</title>
      </Head>
      {!user ? <LoginPage /> : <NotesPage />}
    </>
  );
}
