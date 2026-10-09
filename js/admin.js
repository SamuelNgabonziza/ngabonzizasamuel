import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, getDocs, onSnapshot, serverTimestamp, query, updateDoc, writeBatch } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";
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
let storage;
let currentUser = null;
let editingPostId = null;
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

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
  byId("image-upload-control").hidden = type === "video";
  byId("media-url-label").textContent = type === "video" ? "Public video URL (YouTube or direct .mp4/.webm link)" : "Or paste a public image URL (optional)";
  form.elements.image.placeholder = type === "video" ? "https://youtu.be/… or https://…/clip.mp4" : "https://…";
  if (type === "video" || type === "article") clearSelectedImage();
});
byId("post-type").dispatchEvent(new Event("change"));

let previewUrl = null;
function clearSelectedImage() {
  byId("image-file").value = "";
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;
  const preview = byId("image-preview");
  preview.removeAttribute("src"); preview.hidden = true;
  byId("image-upload-status").textContent = "";
}

byId("image-file").addEventListener("change", event => {
  const file = event.currentTarget.files?.[0];
  const preview = byId("image-preview");
  const uploadStatus = byId("image-upload-status");
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null; preview.hidden = true;
  if (!file) { uploadStatus.textContent = ""; return; }
  if (!file.type.startsWith("image/")) { clearSelectedImage(); uploadStatus.textContent = "Choose an image file from your device."; return; }
  if (file.size > MAX_IMAGE_BYTES) { clearSelectedImage(); uploadStatus.textContent = "That photo is over 12 MB. Choose a smaller image."; return; }
  previewUrl = URL.createObjectURL(file); preview.src = previewUrl; preview.hidden = false;
  uploadStatus.textContent = `${file.name} is ready to upload.`;
});

function uploadImage(file) {
  const safeName = file.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100) || "photo";
  const uniqueId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const destination = storageRef(storage, `post-media/${uniqueId}-${safeName}`);
  const task = uploadBytesResumable(destination, file, { contentType: file.type, cacheControl: "public,max-age=31536000" });
  return new Promise((resolve, reject) => {
    task.on("state_changed", snapshot => {
      const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      byId("image-upload-status").textContent = `Uploading photo… ${progress}%`;
      status.textContent = `Uploading photo… ${progress}%`;
    }, reject, async () => {
      try { resolve(await getDownloadURL(task.snapshot.ref)); } catch (error) { reject(error); }
    });
  });
}
byId("sign-in-form").addEventListener("submit", async event => {
  event.preventDefault(); const values = new FormData(event.currentTarget); authStatus.textContent = "Signing in…";
  try { await signInWithEmailAndPassword(auth, values.get("email"), values.get("password")); }
  catch (error) { authStatus.textContent = `Sign in failed: ${error.message}`; }
});
byId("sign-out").addEventListener("click", () => signOut(auth));
byId("sign-out-unapproved").addEventListener("click", () => signOut(auth));
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
    const selectedImage = byId("image-file").files?.[0];
    if (selectedImage && !currentUser) throw new Error("Sign in with your admin account before uploading photos.");
    let mediaUrl = values.get("image").trim();
    if (selectedImage) {
      if (!selectedImage.type.startsWith("image/")) throw new Error("Choose an image file from your device.");
      if (selectedImage.size > MAX_IMAGE_BYTES) throw new Error("That photo is over 12 MB. Choose a smaller image.");
      mediaUrl = await uploadImage(selectedImage);
      byId("image-url").value = mediaUrl;
      status.textContent = "Photo uploaded. Saving your post…";
    }
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
    form.reset(); clearSelectedImage(); byId("post-type").dispatchEvent(new Event("change"));
  } catch (error) {
    const message = error.code === "storage/unauthorized"
      ? "Firebase Storage rejected the upload. Check that Storage is enabled and its rules allow your admin account to upload images."
      : error.code === "storage/bucket-not-found"
        ? "Firebase Storage is not set up for this project yet. Create its Storage bucket in the Firebase console."
        : error.message;
    status.textContent = `Could not publish: ${message}`;
  }
  finally { button.disabled = false; }
});

function isYouTubeUrl(url) {
  return ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"].includes(url.hostname.toLowerCase());
}

if (!firebaseReady) {
  authStatus.textContent = "Firebase is not connected yet. Add your Firebase web app config to js/firebase-config.js.";
  byId("sign-in-form").hidden = true;
} else {
  const app = initializeApp(firebaseConfig); auth = getAuth(app); db = getFirestore(app); storage = getStorage(app);
  onAuthStateChanged(auth, user => {
    const adminUid = "H4BHAMvfImcwDgWJF9FaXt6bPdC2";
    currentUser = user?.uid === adminUid ? user : null;
    signInPanel.hidden = Boolean(currentUser); studioContent.hidden = !currentUser;
    byId("sign-in-form").hidden = Boolean(user);
    byId("sign-out-unapproved").hidden = !user || Boolean(currentUser);
    if (stopListening) { stopListening(); stopListening = null; }
    if (currentUser) {
      authStatus.textContent = "Signed in.";
      stopListening = onSnapshot(query(collection(db, "posts")), snapshot => {
        const posts = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
        posts.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)); render(posts);
      }, error => { status.textContent = `Could not load posts: ${error.message}`; });
    } else if (user) {
      authStatus.textContent = "This account cannot publish. Sign out and use the website owner’s admin account.";
    } else {
      byId("sign-in-form").hidden = false;
      authStatus.textContent = "Sign in with your Firebase admin account.";
    }
  });
}
