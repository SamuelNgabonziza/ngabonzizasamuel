/*
  HOW TO ADD A NEW PROJECT
  ------------------------
  Copy one of the objects below inside the `projects` array and edit it.
  "accent" can be "amber" or "teal" — it just alternates the color of the side bar.
*/
const projects = [
  {
    title: "Super_Attendance_Maker",
    tag: "Android",
    description: "An attendance-tracking app built for companies and institutions to replace manual sign-in sheets with something faster and harder to falsify.",
    stack: ["Android", "Kotlin/Java", "In progress"],
    link: "https://github.com/SamuelNgabonziza",
    accent: "amber"
  },
  {
    title: "IoT Coffee Dryer Monitoring System",
    tag: "IoT",
    description: "A sensor-based monitoring system for coffee drying — built to give smallholder processors real-time visibility instead of guesswork.",
    stack: ["IoT", "Sensors", "Embedded"],
    link: "https://github.com/SamuelNgabonziza/IoTCoffee_DryerMonitoniring_system",
    accent: "teal"
  }
];

/*
  HOW TO ADD A NEW SERVICE
  -------------------------
  Add an object with a title and description. Keep descriptions to one sentence.
*/
const services = [
  {
    title: "Android app development",
    description: "Building attendance, tracking, and utility apps for small businesses and institutions."
  },
  {
    title: "IoT & embedded systems",
    description: "Sensor-based monitoring systems for agricultural and industrial processes."
  },
  {
    title: "Web development",
    description: "Simple, fast websites — portfolios, landing pages, and small tools."
  }
];

function renderProjects() {
  const container = document.getElementById("project-list");
  container.innerHTML = projects.map(p => `
    <div class="project ${p.accent === "teal" ? "secondary" : ""}">
      <div class="bar"></div>
      <div class="content">
        <h3>${p.title} <span class="tag">${p.tag}</span></h3>
        <p>${p.description}</p>
        <div class="stack">${p.stack.map(s => `<span>${s}</span>`).join("")}</div>
        <a class="link" href="${p.link}" target="_blank" rel="noopener">View on GitHub →</a>
      </div>
    </div>
  `).join("");
}

function renderServices() {
  const container = document.getElementById("service-list");
  container.innerHTML = services.map(s => `
    <div class="service">
      <h3>${s.title}</h3>
      <p>${s.description}</p>
    </div>
  `).join("");
}

// Each page calls the render function(s) it needs after loading this script.

