import { authorizeAPIRequest } from "../../lib/auth";
import { search } from "../../lib/operand";

export default async function handler(req, res) {
  let user = await authorizeAPIRequest(req);
  if (!user) {
    return res.status(401).json({
      error: "Not authorized",
    });
  }
  let { query, docs, snippets } = req.query;
  let results = await search(
    user.operandSet,
    query,
    parseInt(docs),
    parseInt(snippets)
  );
  return res.status(200).json(results);
}
