import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore, addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, where } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { firebaseConfig, firebaseReady } from "./firebase-config.js";

const ADMIN_UID = "H4BHAMvfImcwDgWJF9FaXt6bPdC2";
const list = document.getElementById("public-post-list");
const empty = document.getElementById("public-post-empty");
let db;
let currentUser = null;
let authError = "";
let postsCache = [];
let liveListeners = [];

function listen(unsubscribe) { liveListeners.push(unsubscribe); }
function stopPostListeners() { liveListeners.forEach(stop => stop()); liveListeners = []; }
function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function render(posts) {
  stopPostListeners();
  list.replaceChildren(); empty.hidden = posts.length > 0;
  posts.forEach(post => {
    const card = make("article", "public-post-card");
    card.id = `post-${post.id}`;
    if (post.imageUrl && post.type === "video") {
      const youtubeId = getYoutubeId(post.imageUrl);
      if (youtubeId) {
        const frame = make("iframe"); frame.src = `https://www.youtube-nocookie.com/embed/${youtubeId}`;
        frame.title = post.title; frame.loading = "lazy"; frame.allowFullscreen = true;
        frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        frame.referrerPolicy = "strict-origin-when-cross-origin"; card.append(frame);
      } else {
        const video = make("video", "post-video"); video.src = post.imageUrl; video.controls = true; video.playsInline = true; video.preload = "metadata"; card.append(video);
      }
    } else if (post.imageUrl) {
      const image = make("img"); image.src = post.imageUrl; image.alt = post.title; image.loading = "lazy"; card.append(image);
    }

    const body = make("div", "public-post-body");
    body.append(make("span", "post-badge", post.type));
    body.append(make("h2", "", post.title));
    body.append(make("p", "", post.description));
    body.append(make("small", "", post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : "Recently"));
    if (post.type === "project" && post.link) {
      const link = make("a", "link", "View project ↗"); link.href = post.link; link.target = "_blank"; link.rel = "noopener"; body.append(link);
    }
    card.append(body);

    const interactions = make("div", "post-interactions");
    if (post.allowLikes === true) addLikeControl(interactions, post);
    if (post.allowComments === true) addCommentsControl(interactions, post);
    if (post.allowShare === true) addShareControl(interactions, post);
    if (authError && (post.allowLikes === true || post.allowComments === true)) interactions.append(make("small", "interaction-help", authError));
    if (interactions.childElementCount) card.append(interactions);
    list.append(card);
  });
}

function addLikeControl(parent, post) {
  const button = make("button", "interaction-button", "♥ Like");
  button.type = "button"; button.disabled = !currentUser;
  let liked = false; let busy = false;
  const likes = collection(db, "posts", post.id, "likes");
  listen(onSnapshot(likes, snapshot => {
    liked = Boolean(currentUser && snapshot.docs.some(item => item.id === currentUser.uid));
    button.textContent = `${liked ? "♥ Liked" : "♡ Like"} · ${snapshot.size}`;
    button.setAttribute("aria-pressed", String(liked)); button.disabled = !currentUser || busy;
  }, () => { button.disabled = true; button.title = "Likes need Firebase Anonymous sign-in enabled."; }));
  button.addEventListener("click", async () => {
    if (!currentUser || busy) return;
    busy = true; button.disabled = true;
    try {
      const likeRef = doc(db, "posts", post.id, "likes", currentUser.uid);
      if (liked) await deleteDoc(likeRef);
      else await setDoc(likeRef, { createdAt: serverTimestamp() });
    } catch { button.title = "Could not save your like. Try again."; }
    finally { busy = false; button.disabled = !currentUser; }
  });
  parent.append(button);
}

function addCommentsControl(parent, post) {
  const button = make("button", "interaction-button", "Comments"); button.type = "button";
  const panel = make("div", "comment-panel"); panel.hidden = true;
  const commentList = make("div", "comment-list");
  const form = document.createElement("form"); form.className = "comment-form";
  const input = document.createElement("textarea"); input.name = "comment"; input.maxLength = 1000; input.rows = 2; input.placeholder = "Write a comment…"; input.required = true; input.setAttribute("aria-label", "Write a comment");
  const submit = make("button", "interaction-button comment-submit", "Comment"); submit.type = "submit"; submit.disabled = !currentUser;
  const feedback = make("p", "comment-feedback", authError);
  form.append(input, submit); panel.append(commentList, form, feedback);
  let commentsStop = null;
  button.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden && !commentsStop) {
      commentsStop = onSnapshot(query(collection(db, "posts", post.id, "comments"), orderBy("createdAt", "asc")), snapshot => {
        commentList.replaceChildren();
        if (!snapshot.size) commentList.append(make("p", "no-comments", "No comments yet. Start the conversation."));
        snapshot.docs.forEach(item => {
          const data = item.data(); const row = make("article", "comment-item");
          const dateText = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : "Just now";
          row.append(make("small", "", dateText), make("p", "", data.text || ""));
          if (currentUser && (currentUser.uid === data.uid || currentUser.uid === ADMIN_UID)) {
            const remove = make("button", "comment-delete", "Delete"); remove.type = "button";
            remove.addEventListener("click", async () => {
              if (window.confirm("Delete this comment?")) await deleteDoc(doc(db, "posts", post.id, "comments", item.id)).catch(() => { feedback.textContent = "Could not delete this comment."; });
            });
            row.append(remove);
          }
          commentList.append(row);
        });
      }, () => { feedback.textContent = "Comments could not load. Check Firebase rules."; });
      listen(commentsStop);
    }
  });
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const text = input.value.trim(); if (!text || !currentUser) return;
    submit.disabled = true; feedback.textContent = "Posting comment…";
    try {
      await addDoc(collection(db, "posts", post.id, "comments"), { uid: currentUser.uid, text, createdAt: serverTimestamp() });
      input.value = ""; feedback.textContent = "Comment posted.";
    } catch { feedback.textContent = "Could not post. Enable Anonymous sign-in and publish the updated Firestore rules."; }
    finally { submit.disabled = !currentUser; }
  });
  if (!currentUser) { input.disabled = true; submit.disabled = true; }
  if (authError) feedback.textContent = authError;
  parent.append(button, panel);
}

function addShareControl(parent, post) {
  const button = make("button", "interaction-button", "Share ↗"); button.type = "button";
  button.addEventListener("click", async () => {
    const url = new URL(`posts.html#post-${post.id}`, window.location.href).href;
    try {
      if (navigator.share) await navigator.share({ title: post.title, text: post.description, url });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(url); button.textContent = "Link copied ✓"; }
      else window.prompt("Copy this link to share the post:", url);
    } catch (error) { if (error.name !== "AbortError") button.textContent = "Could not share"; }
  });
  parent.append(button);
}

function getYoutubeId(value) {
  try {
    const url = new URL(value); const host = url.hostname.toLowerCase();
    if (host === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] || "";
    if (!["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)) return "";
    if (url.pathname === "/watch") return url.searchParams.get("v") || "";
    const match = url.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)/); return match?.[1] || "";
  } catch { return ""; }
}

if (!firebaseReady) { render([]); empty.textContent = "Connect Firebase to see published posts."; }
else {
  const app = initializeApp(firebaseConfig); db = getFirestore(app);
  const auth = getAuth(app);
  onAuthStateChanged(auth, user => {
    currentUser = user; authError = "";
    if (!user) signInAnonymously(auth).catch(() => { authError = "Likes and comments need Anonymous sign-in enabled in Firebase."; render(postsCache); });
    else render(postsCache);
  });
  onSnapshot(query(collection(db, "posts"), where("published", "==", true)), snapshot => {
    postsCache = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
    postsCache.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)); render(postsCache);
  }, () => { empty.hidden = false; empty.textContent = "Posts are temporarily unavailable."; });
}
