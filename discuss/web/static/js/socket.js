import { Socket } from "phoenix";

let socket = new Socket("/socket", { params: { token: window.userToken } });

socket.connect();

const createSocket = (topicId) => {
  let channel = socket.channel(`comments:${topicId}`, {});
  channel
    .join()
    .receive("ok", (resp) => {
      renderComments(resp.comments);
    })
    .receive("error", (resp) => {
      console.log("Unable to join", resp);
    });

  channel.on(`comments:${topicId}:new`, renderComment);

  document.querySelector("button").addEventListener("click", () => {
    const content = document.querySelector("textarea").value;
    channel.push("comment:add", { content });
  });

  return channel;
};

function renderComment({ comment } = {}) {
  const renderedComment = commentTemplate(comment);
  document.querySelector(".collection").innerHTML += renderedComment;
}

/**
 * Create a bunch of <li> and look for the <ul> with class .collection and
 * append the comments
 * @param {*} comments
 */
function renderComments(comments = []) {
  const renderedComments = comments.map((comment) => {
    return commentTemplate(comment);
  });
  document.querySelector(".collection").innerHTML = renderedComments.join("");
}

function commentTemplate(comment) {
  return `
  <li class="collection-item">
    ${comment.content}
  </li>
`;
}

window.createSocket = createSocket;
