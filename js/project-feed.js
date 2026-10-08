import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { firebaseConfig, firebaseReady } from "./firebase-config.js";

if (firebaseReady) {
  const db = getFirestore(initializeApp(firebaseConfig));
  const container = document.getElementById("project-list");
  let cloudRows = [];
  onSnapshot(query(collection(db, "posts"), where("published", "==", true)), snapshot => {
    cloudRows.forEach(row => row.remove()); cloudRows = [];
    snapshot.docs.map(item => item.data()).filter(project => project.type === "project").forEach(project => {
      const row = document.createElement("article"); row.className = "project cloud-project";
      if (project.imageUrl) { const image = document.createElement("img"); image.src = project.imageUrl; image.alt = project.title; image.loading = "lazy"; image.className = "cloud-project-image"; row.append(image); }
      const bar = document.createElement("div"); bar.className = "bar";
      const content = document.createElement("div"); content.className = "content";
      const heading = document.createElement("h3"); heading.textContent = project.title;
      const tag = document.createElement("span"); tag.className = "tag"; tag.textContent = "New project"; heading.append(" ", tag);
      const description = document.createElement("p"); description.textContent = project.description;
      content.append(heading, description);
      if (project.link) { const link = document.createElement("a"); link.href = project.link; link.target = "_blank"; link.rel = "noopener"; link.className = "link"; link.textContent = "View project ↗"; content.append(link); }
      row.append(bar, content); container.append(row); cloudRows.push(row);
    });
  });
}
