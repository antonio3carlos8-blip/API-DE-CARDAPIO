// Entrypoint das Vercel Functions.
//
// Na Vercel não existe processo de longa duração: cada requisição invoca uma
// function. Por isso aqui o app Express é apenas exportado como handler, sem
// `listen()`. O `src/server.js` continua sendo o entrypoint para rodar local.
//
// Sem este arquivo o deploy sobe com zero functions e todo caminho vira 404.
import app from "../src/app.js";

export default app;
