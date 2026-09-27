import type { APIRoute, GetStaticPaths } from "astro";
import fs from "node:fs";
import { listOfferTypes } from "../../lib/offer-types";

export const getStaticPaths = (() =>
  listOfferTypes()
    .filter((t) => t.templateFile)
    .map((t) => ({ params: { type: t.folder } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) => {
  const type = listOfferTypes().find((t) => t.folder === params.type);
  if (!type?.templateFile) return new Response("Template not found", { status: 404 });

  return new Response(fs.readFileSync(type.templateFile), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  });
};
