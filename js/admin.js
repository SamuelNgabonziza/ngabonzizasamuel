import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, getDocs, onSnapshot, serverTimestamp, query, updateDoc, writeBatch } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { firebaseConfig, firebaseReady } from "./firebase-config.js";

const byId = id => document.getElementById(id);
const form = byId("post-form");
const list = byId("admin-post-list");
const empty = byId("empty-posts");
const status = byId("form-status");
const authStatus = byId("auth-status");
const signInPanel = byId("sign-in-panel");
const studioContent = byId("studio-content");
let stopListening = null;
let auth;
let db;
let editingPostId = null;

function render(posts) {
  list.replaceChildren(); empty.hidden = posts.length > 0;
  posts.forEach(post => {
    const row = document.createElement("article"); row.className = "admin-post-row";
    const info = document.createElement("div");
    const badge = document.createElement("span"); badge.className = "post-badge"; badge.textContent = post.type;
    if (post.published === false) { badge.textContent += " · hidden"; badge.classList.add("post-badge-hidden"); }
    const title = document.createElement("h3"); title.textContent = post.title;
    const date = document.createElement("p"); date.textContent = post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : "Just now";
    info.append(badge, title, date);
    const remove = document.createElement("button"); remove.type = "button"; remove.className = "delete-post"; remove.textContent = "Delete";
    remove.addEventListener("click", async () => {
      if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
      remove.disabled = true;
      try {
        for (const subcollection of ["likes", "comments"]) {
          const children = await getDocs(collection(db, "posts", post.id, subcollection));
          for (let start = 0; start < children.docs.length; start += 400) {
            const batch = writeBatch(db);
            children.docs.slice(start, start + 400).forEach(child => batch.delete(child.ref));
            await batch.commit();
          }
        }
        await deleteDoc(doc(db, "posts", post.id));
      } catch (error) { status.textContent = `Could not delete post: ${error.message}`; remove.disabled = false; }
    });
    const edit = document.createElement("button"); edit.type = "button"; edit.className = "edit-post"; edit.textContent = "Edit";
    edit.addEventListener("click", () => {
      editingPostId = post.id;
      byId("post-type").value = post.type; byId("post-type").dispatchEvent(new Event("change"));
      form.elements.title.value = post.title || "";
      form.elements.description.value = post.description || "";
      form.elements.image.value = post.imageUrl || "";
      form.elements.link.value = post.link || "";
      form.elements.published.checked = post.published !== false;
      form.elements.allowLikes.checked = post.allowLikes === true;
      form.elements.allowComments.checked = post.allowComments === true;
      form.elements.allowShare.checked = post.allowShare === true;
      byId("save-post").innerHTML = "Update post <span>↗</span>";
      byId("cancel-edit").hidden = false;
      status.textContent = `Editing “${post.title}”. Make changes, then save them.`;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    row.append(info, edit, remove); list.append(row);
  });
}

byId("post-type").addEventListener("change", () => {
  const type = byId("post-type").value;
  form.querySelector(".image-field").hidden = type === "article";
  form.querySelector(".link-field").hidden = type !== "project";
  byId("media-url-label").textContent = type === "video" ? "Public video URL (YouTube or direct .mp4/.webm link)" : "Public image URL (optional)";
  form.elements.image.placeholder = type === "video" ? "https://youtu.be/… or https://…/clip.mp4" : "https://your-site.com/images/photo.jpg";
});
byId("post-type").dispatchEvent(new Event("change"));
byId("sign-in-form").addEventListener("submit", async event => {
  event.preventDefault(); const values = new FormData(event.currentTarget); authStatus.textContent = "Signing in…";
  try { await signInWithEmailAndPassword(auth, values.get("email"), values.get("password")); }
  catch (error) { authStatus.textContent = `Sign in failed: ${error.message}`; }
});
byId("sign-out").addEventListener("click", () => signOut(auth));
byId("cancel-edit").addEventListener("click", () => {
  editingPostId = null; form.reset(); byId("post-type").dispatchEvent(new Event("change"));
  byId("save-post").innerHTML = "Publish post <span>↗</span>"; byId("cancel-edit").hidden = true;
  status.textContent = "Edit cancelled.";
});

form.addEventListener("submit", async event => {
  event.preventDefault();
  const button = form.querySelector("button[type=submit]"); button.disabled = true; status.textContent = "Publishing…";
  const values = new FormData(form);
  try {
    const mediaUrl = values.get("image").trim();
    if (mediaUrl) {
      const parsedUrl = new URL(mediaUrl);
      if (parsedUrl.protocol !== "https:") throw new Error("Use a public HTTPS media URL.");
      if (values.get("type") === "video" && !isYouTubeUrl(parsedUrl) && !/\.(mp4|webm|ogg|ogv)$/i.test(parsedUrl.pathname)) {
        throw new Error("Use a YouTube link or a direct .mp4, .webm, or .ogg URL.");
      }
    }
    const postData = {
      type: values.get("type"), title: values.get("title").trim(), description: values.get("description").trim(),
      imageUrl: mediaUrl, link: values.get("link").trim(), published: form.elements.published.checked,
      allowLikes: form.elements.allowLikes.checked,
      allowComments: form.elements.allowComments.checked,
      allowShare: form.elements.allowShare.checked,
      updatedAt: serverTimestamp()
    };
    if (editingPostId) {
      await updateDoc(doc(db, "posts", editingPostId), postData);
      editingPostId = null; byId("save-post").innerHTML = "Publish post <span>↗</span>"; byId("cancel-edit").hidden = true;
      status.textContent = postData.published ? "Changes saved. The post is public." : "Changes saved. The post is hidden from visitors.";
    } else {
      await addDoc(collection(db, "posts"), { ...postData, createdAt: serverTimestamp() });
      status.textContent = postData.published ? "Published. It is now shared on the Notes & photos page." : "Saved as hidden. Visitors cannot see it until you enable public display.";
    }
    form.reset(); byId("post-type").dispatchEvent(new Event("change"));
  } catch (error) { status.textContent = `Could not publish: ${error.message}`; }
  finally { button.disabled = false; }
});

function isYouTubeUrl(url) {
  return ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"].includes(url.hostname.toLowerCase());
}

if (!firebaseReady) {
  authStatus.textContent = "Firebase is not connected yet. Add your Firebase web app config to js/firebase-config.js.";
  byId("sign-in-form").hidden = true;
} else {
  const app = initializeApp(firebaseConfig); auth = getAuth(app); db = getFirestore(app);
  onAuthStateChanged(auth, user => {
    signInPanel.hidden = Boolean(user); studioContent.hidden = !user;
    if (stopListening) { stopListening(); stopListening = null; }
    if (user) {
      authStatus.textContent = "Signed in.";
      stopListening = onSnapshot(query(collection(db, "posts")), snapshot => {
        const posts = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
        posts.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)); render(posts);
      }, error => { status.textContent = `Could not load posts: ${error.message}`; });
    } else authStatus.textContent = "Sign in with your Firebase admin account.";
  });
}
