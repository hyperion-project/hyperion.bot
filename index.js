import pr_comment from "./src/pr_comment.js";
import issues from "./src/issues.js";

export default (app) => {
  app.on(["pull_request.opened", "pull_request.synchronize"], pr_comment);
  app.on("issues.opened", issues);
};
