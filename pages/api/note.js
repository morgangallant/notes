import prisma from "../../lib/prisma";
import { authorizeAPIRequest } from "../../lib/auth";
import {
  createDocument,
  updateDocument,
  deleteDocument,
} from "../../lib/operand";

function urlForNote(id) {
  return `http://localhost:3000/n/${id}`;
}

async function handleCreate(req, res) {
  let user = await authorizeAPIRequest(req);
  if (!user) {
    return res.status(401).json({
      error: "Not authorized",
    });
  }
  let { title } = req.body;
  let note = await prisma.note.create({
    data: {
      title,
      content: "",
      User: {
        connect: {
          id: user.id,
        },
      },
    },
  });
  let doc = await createDocument(user.operandSet, title, urlForNote(note.id));
  note = await prisma.note.update({
    where: {
      id: note.id,
    },
    data: {
      operandDoc: doc.id,
    },
  });
  return res.status(200).json({
    note,
  });
}

async function handleGet(req, res) {
  let user = await authorizeAPIRequest(req);
  if (!user) {
    return res.status(401).json({
      error: "Not authorized",
    });
  }
  if (req.params && req.params.id) {
    let id = req.params.id;
    let note = await prisma.note.findUnique({
      where: {
        id,
      },
    });
    if (!note) {
      return res.status(404).json({
        error: "Note not found",
      });
    } else if (note.userId != user.id) {
      return res.status(401).json({
        error: "Not authorized",
      });
    }
    return res.status(200).json({
      note,
    });
  } else {
    let notes = await prisma.note.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json({
      notes,
    });
  }
}

async function handleUpdate(req, res) {
  let user = await authorizeAPIRequest(req);
  if (!user) {
    return res.status(401).json({
      error: "Not authorized",
    });
  }
  let { id } = req.query;
  let { content } = req.body;
  let note = await prisma.note.findUnique({
    where: {
      id,
    },
  });
  if (!note) {
    return res.status(404).json({
      error: "Note not found",
    });
  } else if (note.userId != user.id) {
    return res.status(401).json({
      error: "Not authorized",
    });
  }
  note = await prisma.note.update({
    where: {
      id,
    },
    data: {
      content,
    },
  });
  await updateDocument(
    note.operandDoc,
    note.title,
    urlForNote(note.id),
    content
  );
  return res.status(200).json({
    note,
  });
}

async function handleDelete(req, res) {
  let user = await authorizeAPIRequest(req);
  if (!user) {
    return res.status(401).json({
      error: "Not authorized",
    });
  }
  let { id } = req.query;
  let note = await prisma.note.findUnique({
    where: {
      id,
    },
  });
  if (!note) {
    return res.status(404).json({
      error: "Note not found",
    });
  } else if (note.userId != user.id) {
    return res.status(401).json({
      error: "Not authorized",
    });
  }
  await deleteDocument(note.operandDoc);
  await prisma.note.delete({
    where: {
      id,
    },
  });
  return res.status(200).json({});
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    return handleCreate(req, res);
  } else if (req.method === "GET") {
    return handleGet(req, res);
  } else if (req.method === "PUT") {
    return handleUpdate(req, res);
  } else if (req.method === "DELETE") {
    return handleDelete(req, res);
  }
  res.status(405).json({
    error: "Invalid method",
  });
}
