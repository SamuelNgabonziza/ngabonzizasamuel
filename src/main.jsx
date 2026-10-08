import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight, ArrowUpRight, Camera, Globe,
  Menu, Moon, Music2, Sparkles, Sun, X
} from 'lucide-react';
import { projects, services } from '../js/script.js';
import './app.css';

const navItems = [
  ['Home', 'index.html', 'home'], ['Work', 'projects.html', 'projects'],
  ['About', 'about.html', 'about'], ['Services', 'services.html', 'services'],
  ['Notes & photos', 'posts.html', 'posts'], ['Contact', 'contact.html', 'contact']
];

function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('flowshield-theme-v2', dark ? 'dark' : 'light'); } catch { /* private browsing */ }
  }, [dark]);
  return [dark, () => setDark(value => !value)];
}

function Header({ page, dark, toggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <header className="site-header sticky top-0 z-40 border-b border-white/10 bg-[#11131b]/90 text-white backdrop-blur-xl">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
      <a href="index.html" className="brand group inline-flex shrink-0 items-center gap-2.5 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300" aria-label="FlowShield home">
        <span className="brand-orbit" aria-hidden="true"><i /><i /><i /></span>
        <span className="font-display text-xl font-semibold tracking-tight">FlowShield<span className="text-[#ff856e]">.</span></span>
      </a>
      <button className="grid size-9 place-items-center rounded-full border border-white/15 text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 lg:hidden" type="button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X size={18} /> : <Menu size={18} />}</button>
      <nav id="primary-navigation" aria-label="Main navigation" className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col gap-1 border-b border-white/10 bg-[#11131b]/[.98] p-4 shadow-2xl lg:static lg:flex lg:flex-row lg:items-center lg:gap-5 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}>
        <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-5">
          {navItems.map(([label, href, key]) => <a key={key} href={href} aria-current={page === key ? 'page' : undefined} className={`inline-flex min-h-10 items-center rounded-md px-2 text-[13px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 lg:min-h-8 lg:px-0 ${page === key ? 'text-white' : 'text-white/65 hover:text-white'}`}><span className={page === key ? 'border-b border-[#ff856e] pb-1' : ''}>{label}</span></a>)}
        </div>
        <div className="mt-2 flex items-center gap-3 border-t border-white/10 pt-3 lg:ml-1 lg:mt-0 lg:border-0 lg:pt-0">
          <button type="button" onClick={toggleTheme} className="grid size-9 shrink-0 place-items-center rounded-full border border-white/15 text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300" aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`} title={`Switch to ${dark ? 'light' : 'dark'} theme`}>{dark ? <Sun size={15} /> : <Moon size={15} />}</button>
          <a href="auth.html?mode=login" className="px-2 py-2 text-[13px] font-medium text-white/80 transition hover:text-white">Log in</a>
          <a href="auth.html?mode=signup" className="inline-flex min-h-9 items-center rounded-full border border-white/20 bg-white px-4 py-2 text-[12px] font-bold text-[#171923] transition hover:bg-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">Sign up</a>
        </div>
      </nav>
    </div>
  </header>;
}

const socials = [
  { label: 'Instagram', href: 'https://www.instagram.com/', Icon: Camera },
  { label: 'FlowShield home', href: 'index.html', Icon: Globe },
  { label: 'TikTok', href: 'https://www.tiktok.com/', Icon: Music2 },
];

function Footer() {
  return <footer className="relative z-10 mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-8 lg:px-10">
    <div className="grid gap-10 border-t border-light-border py-10 dark:border-dark-border md:grid-cols-[1fr_auto] md:items-end">
      <div><a href="index.html" className="font-display text-3xl font-semibold">FlowShield<span className="text-light-accent dark:text-dark-accent">.</span></a><p className="mt-3 max-w-md text-sm leading-7 text-light-muted dark:text-dark-muted">Built for the curious. Made for ideas in motion.</p></div>
      <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-light-muted dark:text-dark-muted"><a className="hover:text-light-primary dark:hover:text-dark-primary" href="projects.html">Work</a><a className="hover:text-light-primary dark:hover:text-dark-primary" href="posts.html">Ideas</a><a className="hover:text-light-primary dark:hover:text-dark-primary" href="contact.html">Contact</a><a className="hover:text-light-primary dark:hover:text-dark-primary" href="admin.html">Studio</a></div>
    </div>
    <nav className="relative z-10 flex justify-center gap-4 pb-12" aria-label="Social and site links">
      {socials.map(({ label, href, Icon }) => <a key={label} href={href} aria-label={label} title={label} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} className="group grid size-12 place-items-center rounded-full border border-white/60 bg-white/65 p-4 text-light-text shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-light-primary/40 hover:bg-light-secondary hover:text-light-primary hover:shadow-glass focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-light-primary dark:border-white/10 dark:bg-white/5 dark:text-dark-text dark:hover:border-dark-primary/50 dark:hover:bg-dark-secondary dark:hover:text-dark-primary dark:focus-visible:outline-dark-primary"><Icon aria-hidden="true" size={19} strokeWidth={1.7} /></a>)}
    </nav>
    <div className="flex flex-col gap-2 border-t border-light-border pt-5 text-xs text-light-muted dark:border-dark-border dark:text-dark-muted sm:flex-row sm:items-center sm:justify-between"><span>Copyright {new Date().getFullYear()} Samuel Ngabonziza</span><span>Soroti University | Computer &amp; Electronics Engineering | Uganda</span></div>
  </footer>;
}

function Frame({ page, children, dark, toggleTheme }) {
  return <><a href="#main-content" className="skip-link">Skip to content</a><Header page={page} dark={dark} toggleTheme={toggleTheme} /><main id="main-content">{children}</main><Footer /></>;
}

function SectionEyebrow({ children }) { return <p className="mb-4 text-xs font-bold uppercase tracking-[.19em] text-light-primary dark:text-dark-primary">{children}</p>; }

function HomePage() {
  const frameRef = useRef(null);
  const canvasRef = useRef(null);
  useEffect(() => {
    let destroy;
    let cancelled = false;
    import('../js/hero-earth.js').then(({ initHeroEarth }) => {
      if (!cancelled) destroy = initHeroEarth(canvasRef.current, frameRef.current);
    });
    return () => { cancelled = true; destroy?.(); };
  }, []);
  const paths = [
    { no: '01', title: 'Explore the work', text: 'Real projects at the meeting point of code, sensors, and everyday needs.', href: 'projects.html' },
    { no: '02', title: 'Find your angle', text: 'A practical mix of software, electronics, and curious problem solving.', href: 'services.html' },
    { no: '03', title: 'Follow the ideas', text: 'Notes, photographs, and small moments from the process.', href: 'posts.html' }
  ];

  return <>
    <section className="home-hero relative isolate mx-auto grid min-h-[min(780px,calc(100svh-58px))] max-w-7xl items-center gap-4 px-5 py-12 sm:px-8 lg:grid-cols-[.92fr_1.08fr] lg:gap-0 lg:px-10 lg:py-10">
      <div className="relative z-10 max-w-2xl py-6 lg:py-12">
        <SectionEyebrow><span className="mr-2 inline-block size-2 rounded-full bg-light-accent align-middle dark:bg-dark-accent" /> Independent maker | Uganda</SectionEyebrow>
        <h1 className="font-display text-[clamp(2.8rem,5.8vw,5.6rem)] font-medium leading-[.92] tracking-[-.045em] text-light-text dark:text-dark-text">The universe<br />of ideas <span className="italic text-light-primary dark:text-dark-primary">awaits.</span></h1>
        <p className="mt-8 max-w-xl text-lg leading-8 text-light-muted dark:text-dark-muted sm:text-xl">I'm Samuel, a builder exploring the space between software, hardware, and the everyday problems worth solving.</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href="projects.html" className="inline-flex min-h-12 items-center gap-3 rounded-full bg-light-primary px-6 py-3 font-semibold text-white shadow-lg shadow-light-primary/20 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-light-accent dark:bg-dark-primary dark:text-dark-background dark:shadow-none dark:focus-visible:outline-dark-accent">Explore every angle <ArrowUpRight size={17} /></a>
          <a href="posts.html" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-light-border px-6 py-3 font-semibold text-light-text transition hover:border-light-primary/50 hover:bg-light-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-light-primary dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-secondary dark:focus-visible:outline-dark-primary">Reveal in radiance <Sparkles size={16} /></a>
        </div>
        <div className="mt-9 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-light-muted dark:text-dark-muted"><span>Curious by nature.</span><Sparkles aria-hidden="true" size={16} className="text-light-accent dark:text-dark-accent" /><span>Building with purpose.</span></div>
      </div>
      <div ref={frameRef} className="hero-art relative mx-auto aspect-square w-full max-w-[610px] overflow-visible" aria-label="Rotating satellite-textured Earth with three colorful 3D rings" role="group">
        <img className="earth-fallback absolute left-1/2 top-1/2 z-0 w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full" src="images/earth-blue-marble.jpg" alt="" aria-hidden="true" />
        <canvas ref={canvasRef} className="absolute inset-0 z-[1] size-full" aria-hidden="true" />
        <span className="pointer-events-none absolute bottom-[8%] right-[7%] z-10 font-display text-2xl italic text-light-primary/70 dark:text-dark-primary/70">Ideas in motion</span>
      </div>
    </section>

    <section className="border-y border-light-border bg-light-surface py-24 dark:border-dark-border dark:bg-dark-surface sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end lg:px-10">
        <div><SectionEyebrow>Built for the curious</SectionEyebrow><h2 className="max-w-xl font-display text-5xl font-medium leading-[.98] tracking-tight sm:text-6xl">Where curiosity<br />meets <span className="italic text-light-primary dark:text-dark-primary">clarity.</span></h2></div>
        <p className="max-w-2xl text-lg leading-8 text-light-muted dark:text-dark-muted">We're building a space where readers find depth, writers find reach, and every idea becomes a conversation worth having.</p>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28 lg:px-10">
      <div className="mb-10 flex flex-col gap-5 sm:mb-14 sm:flex-row sm:items-end sm:justify-between"><div><SectionEyebrow>Pick your path</SectionEyebrow><h2 className="font-display text-5xl font-medium tracking-tight sm:text-6xl">A place to begin.</h2></div><a href="about.html" className="inline-flex items-center gap-2 font-semibold text-light-primary hover:gap-3 dark:text-dark-primary">A little about me <ArrowRight size={17} /></a></div>
      <div className="grid gap-4 md:grid-cols-3">{paths.map((path, index) => <a key={path.no} href={path.href} className={`path-card path-card-${index + 1} group rounded-3xl border border-light-border bg-light-surface p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-light-primary/40 hover:shadow-glass focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-light-primary dark:border-dark-border dark:bg-dark-surface dark:hover:border-dark-primary/45 dark:hover:shadow-glass-dark dark:focus-visible:outline-dark-primary sm:p-8`}><div className="mb-12 flex items-center justify-between text-sm text-light-muted dark:text-dark-muted"><span>{path.no}</span><span className="grid size-10 place-items-center rounded-full bg-light-secondary text-light-primary transition group-hover:rotate-45 dark:bg-dark-secondary dark:text-dark-primary"><ArrowUpRight size={18} /></span></div><h3 className="font-display text-3xl font-semibold">{path.title}</h3><p className="mt-3 max-w-sm leading-7 text-light-muted dark:text-dark-muted">{path.text}</p></a>)}</div>
    </section>

    <section className="universe-panel relative isolate overflow-hidden px-5 py-24 text-center text-white sm:px-8 sm:py-32">
      <div className="universe-stars" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-3xl"><SectionEyebrow>There is always another perspective</SectionEyebrow><h2 className="font-display text-5xl font-medium leading-[.96] tracking-tight sm:text-7xl">Ideas travel further<br /><span className="italic text-cyan-200">when they are shared.</span></h2><p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/75 sm:text-lg">Follow what is taking shape, share your own point of view, and help turn a good question into something real.</p><a href="auth.html?mode=signup" className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-6 py-3 font-semibold text-[#302052] transition hover:-translate-y-0.5 hover:bg-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Join the conversation <ArrowUpRight size={17} /></a></div>
    </section>
  </>;
}

function PageHero({ eyebrow, title, description }) {
  return <header className="mx-auto max-w-6xl px-5 pb-10 pt-16 sm:px-8 sm:pb-14 sm:pt-20 lg:px-10"><SectionEyebrow>{eyebrow}</SectionEyebrow><h1 className="max-w-5xl font-display text-[clamp(2.7rem,5.3vw,5.1rem)] font-medium leading-[.96] tracking-tight">{title}</h1><p className="mt-5 max-w-reading text-base leading-7 text-light-muted dark:text-dark-muted sm:text-lg">{description}</p></header>;
}

function AboutPage() {
  const focus = [['Building with', ['Python', 'Android development', 'Web development']], ['Learning toward', ['Artificial intelligence', 'IoT & embedded systems', 'Digital skills, broadly']]];
  return <><PageHero eyebrow="The person behind the projects" title={<>A builder at the<br /><span className="italic text-light-primary dark:text-dark-primary">intersection.</span></>} description="Undergraduate at Soroti University, studying Computer & Electronics Engineering - the intersection of hardware and software is where I like to work." />
    <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-24 sm:px-8 lg:grid-cols-[.55fr_1fr] lg:px-10"><div><SectionEyebrow>Background</SectionEyebrow><h2 className="font-display text-4xl font-medium">Making ideas<br />useful in the world.</h2></div><div className="space-y-5 text-lg leading-8 text-light-muted dark:text-dark-muted"><p>I'm currently building toward two things at once: practical software (Android apps, web tools) and the electronics side that lets that software talk to the real world - sensors, monitoring systems, embedded devices.</p><p>My interests right now are AI, Python, Android development, and web development - with a growing focus on IoT and embedded systems, since that's where my engineering background gives me an edge over a purely software path.</p></div></section>
    <section className="border-y border-light-border bg-light-surface py-20 dark:border-dark-border dark:bg-dark-surface"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><SectionEyebrow>Focus areas</SectionEyebrow><div className="grid gap-8 md:grid-cols-2">{focus.map(([title, items], groupIndex) => <article key={title} className={`rounded-3xl border border-light-border p-7 dark:border-dark-border sm:p-9 focus-card-${groupIndex + 1}`}><h2 className="font-display text-3xl font-semibold">{title}</h2><ul className="mt-5 flex flex-wrap gap-2">{items.map((item, itemIndex) => <li key={item} className={`focus-chip focus-chip-${(groupIndex + itemIndex) % 5} rounded-full px-4 py-2 text-sm font-semibold`}>{item}</li>)}</ul></article>)}</div></div></section>
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10"><p className="font-display text-4xl italic leading-tight text-light-primary dark:text-dark-primary sm:text-6xl">"Stay curious. Make it useful. Keep moving."</p></section></>;
}

function ProjectsPage() {
  useEffect(() => { import('../js/project-feed.js'); }, []);
  return <><PageHero eyebrow="Work in progress and in the world" title={<>Ideas made<br /><span className="italic text-light-primary dark:text-dark-primary">tangible.</span></>} description="What's actually built and shipping right now - more added as they ship." />
    <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-10"><div className="mb-6 flex items-end justify-between gap-4"><div><SectionEyebrow>Selected projects</SectionEyebrow><h2 className="font-display text-4xl font-semibold">Small teams. Useful things.</h2></div><span className="hidden text-sm text-light-muted dark:text-dark-muted sm:block">UG | Software &amp; electronics</span></div>
      <div id="project-list" className="grid gap-4 md:grid-cols-2" aria-live="polite">{projects.map((project, index) => <article key={project.title} className="project-card group rounded-3xl border border-light-border bg-light-surface p-7 transition hover:-translate-y-1 hover:shadow-glass dark:border-dark-border dark:bg-dark-surface dark:hover:shadow-glass-dark sm:p-9"><div className="mb-10 flex items-center justify-between"><span className="rounded-full bg-light-secondary px-3 py-1 text-xs font-semibold text-light-primary dark:bg-dark-secondary dark:text-dark-primary">{project.tag}</span><span className="font-display text-xl italic text-light-muted dark:text-dark-muted">0{index + 1}</span></div><h3 className="font-display text-3xl font-semibold leading-tight">{project.title}</h3><p className="mt-4 leading-7 text-light-muted dark:text-dark-muted">{project.description}</p><div className="mt-5 flex flex-wrap gap-2">{project.stack.map(item => <span key={item} className="rounded-full border border-light-border px-3 py-1 text-xs text-light-muted dark:border-dark-border dark:text-dark-muted">{item}</span>)}</div><a className="mt-7 inline-flex items-center gap-2 font-semibold text-light-primary transition group-hover:gap-3 dark:text-dark-primary" href={project.link} target="_blank" rel="noopener noreferrer">View on GitHub <ArrowUpRight size={16} /></a></article>)}</div>
    </section></>;
}

function ServicesPage() {
  return <><PageHero eyebrow="From idea to working build" title={<>Make it work.<br /><span className="italic text-light-primary dark:text-dark-primary">Make it matter.</span></>} description="What I can build for you or your organization." />
    <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-10"><div className="grid gap-4 md:grid-cols-3">{services.map((service, index) => <article key={service.title} className={`service-card service-card-${index % 5} rounded-3xl border border-light-border bg-light-surface p-7 dark:border-dark-border dark:bg-dark-surface sm:p-9`}><div className={`service-number service-number-${index % 5} mb-10 grid size-12 place-items-center rounded-2xl font-display text-2xl`}>0{index + 1}</div><h2 className="font-display text-3xl font-semibold leading-tight">{service.title}</h2><p className="mt-4 leading-7 text-light-muted dark:text-dark-muted">{service.description}</p><a href="contact.html" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-light-primary dark:text-dark-primary">Talk through an idea <ArrowRight size={16} /></a></article>)}</div></section></>;
}

function PostsPage() {
  useEffect(() => { import('../js/posts.js'); }, []);
  return <><PageHero eyebrow="Notes, photos & small discoveries" title={<>A journal of<br /><span className="italic text-light-primary dark:text-dark-primary">what's unfolding.</span></>} description="Projects in progress, moments from the work, and ideas worth sharing." />
    <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-10"><div id="public-post-list" className="public-post-grid grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-live="polite" /><p id="public-post-empty" className="empty-posts rounded-3xl border border-light-border bg-light-surface p-10 text-center text-light-muted dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted">Nothing has been posted here yet. Check back soon.</p></section></>;
}

function ContactPage() {
  return <><PageHero eyebrow="Start a good conversation" title={<>Have a good<br /><span className="italic text-light-primary dark:text-dark-primary">problem?</span></>} description="Open to internships, collaboration, feedback, and conversations about what FlowShield becomes." />
    <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-28 sm:px-8 lg:grid-cols-[1fr_.8fr] lg:px-10"><div className="contact-color-panel rounded-[2rem] p-8 text-white sm:p-12"><SectionEyebrow>Tell me what you're thinking</SectionEyebrow><h2 className="font-display text-4xl font-medium leading-tight sm:text-5xl">Every useful thing starts with a question.</h2><p className="mt-5 max-w-lg leading-7 text-white/85">Send a short note. I'll get back to you by email.</p><a href="mailto:ngabonzizasamuelprosper@gmail.com?subject=Lets%20talk" className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-6 py-3 font-semibold text-light-primary transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><span>Write an email</span><ArrowUpRight size={17} /></a></div>
      <div className="flex flex-col justify-center gap-6"><ContactLink label="Email" value="ngabonzizasamuelprosper@gmail.com" href="mailto:ngabonzizasamuelprosper@gmail.com" /><ContactLink label="GitHub" value="SamuelNgabonziza" href="https://github.com/SamuelNgabonziza" /><ContactLink label="LinkedIn" value="Ngabonziza Samuel" href="https://www.linkedin.com/in/ngabonziza-samuel-7755a937b" /></div>
    </section></>;
}

function ContactLink({ label, value, href }) { return <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} className="group flex items-center justify-between gap-5 border-b border-light-border py-4 transition hover:border-light-primary dark:border-dark-border dark:hover:border-dark-primary"><span><span className="block text-xs font-semibold uppercase tracking-[.15em] text-light-muted dark:text-dark-muted">{label}</span><span className="mt-1 block break-all font-medium">{value}</span></span><ArrowUpRight className="shrink-0 text-light-primary transition group-hover:-translate-y-1 group-hover:translate-x-1 dark:text-dark-primary" size={18} /></a>; }

function AuthPage() {
  useEffect(() => { import('../js/auth.js').then(({ initAuth }) => initAuth()); }, []);
  return <><PageHero eyebrow="Join the conversation" title={<>Find your place<br /><span className="italic text-light-primary dark:text-dark-primary">in the story.</span></>} description="Create an account to join a community for curious readers, thoughtful writers, and people turning ideas into action." />
    <section className="mx-auto max-w-xl px-5 pb-28 sm:px-8"><div className="rounded-[2rem] border border-light-border bg-light-surface p-7 shadow-glass dark:border-dark-border dark:bg-dark-surface dark:shadow-glass-dark sm:p-10"><div className="mb-7 flex rounded-full bg-light-secondary p-1 dark:bg-dark-secondary"><a id="auth-login-tab" href="auth.html?mode=login" className="flex-1 rounded-full px-4 py-2.5 text-center text-sm font-semibold">Log in</a><a id="auth-signup-tab" href="auth.html?mode=signup" className="flex-1 rounded-full px-4 py-2.5 text-center text-sm font-semibold">Sign up</a></div>
      <h2 id="auth-heading" className="font-display text-4xl font-semibold">Welcome back.</h2><p id="auth-description" className="mt-2 text-sm leading-6 text-light-muted dark:text-dark-muted">Sign in to continue exploring.</p>
      <form id="auth-form" className="mt-7 grid gap-5"><label className="grid gap-2 text-sm font-semibold" htmlFor="auth-email">Email address<input id="auth-email" className="auth-input" type="email" name="email" required autoComplete="email" placeholder="you@example.com" /></label><label className="grid gap-2 text-sm font-semibold" htmlFor="auth-password">Password<input id="auth-password" className="auth-input" type="password" name="password" required minLength="6" autoComplete="current-password" placeholder="At least 6 characters" /></label><label id="confirm-password-wrap" className="hidden grid gap-2 text-sm font-semibold" htmlFor="auth-confirm-password">Confirm password<input id="auth-confirm-password" className="auth-input" type="password" name="confirmPassword" minLength="6" autoComplete="new-password" placeholder="Re-enter your password" /></label><button id="auth-submit" className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-light-primary px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-light-accent dark:bg-dark-primary dark:text-dark-background dark:focus-visible:outline-dark-accent" type="submit">Log in <ArrowRight size={17} /></button><p id="auth-status" className="min-h-6 text-sm text-light-muted dark:text-dark-muted" aria-live="polite">Email and password are handled securely by Firebase Authentication.</p></form>
      <p className="mt-5 text-xs leading-6 text-light-muted dark:text-dark-muted">By continuing, you agree to use this space respectfully. Your password is never stored by this website.</p>
    </div></section></>;
}

const pageMap = { home: HomePage, about: AboutPage, projects: ProjectsPage, services: ServicesPage, posts: PostsPage, contact: ContactPage, auth: AuthPage };
function App() {
  const page = document.body.dataset.page || 'home';
  const Page = pageMap[page] || HomePage;
  const [dark, toggleTheme] = useTheme();
  useEffect(() => { document.title = `${page === 'home' ? 'Ideas into impact' : page[0].toUpperCase() + page.slice(1)} - FlowShield`; }, [page]);
  return <Frame page={page} dark={dark} toggleTheme={toggleTheme}><Page /></Frame>;
}

createRoot(document.getElementById('root')).render(<App />);

