<div align="center">

<img src="img/logo.svg" alt="CSE 309 logo" height="76">

# CSE 309 · Operating System

**Interactive slide-deck course notes for Operating System.**

<a href="https://ayan-1829.github.io/CSE-309-Operating-System/"><img alt="Live site: open" src="https://img.shields.io/badge/Live_site-open-3446A8?style=for-the-badge&logo=githubpages&logoColor=white"></a>
<img alt="Chapters: 9" src="https://img.shields.io/badge/Chapters-9-555555?style=for-the-badge">
<img alt="Slides: 347" src="https://img.shields.io/badge/Slides-347-555555?style=for-the-badge">
<img alt="Build step: none" src="https://img.shields.io/badge/Build_step-none-555555?style=for-the-badge&logo=html5&logoColor=white">

### [🌐 Open the live site →](https://ayan-1829.github.io/CSE-309-Operating-System/)

</div>

<br>

<p align="center"><a href="https://ayan-1829.github.io/CSE-309-Operating-System/practice.html">Practice problems</a> · <a href="https://ayan-1829.github.io/CSE-309-Operating-System/reference.html">Cheat sheet</a> · <a href="https://ayan-1829.github.io/CSE-309-Operating-System/course.html">Course outline</a></p>

## ✨ Highlights

<table>
<tr><td width="50%" valign="top">🧭&nbsp; 9 chapter decks that keep the content of the CSE 309 lecture slides (Silberschatz, 10th ed.), split into midterm and final syllabus</td><td width="50%" valign="top">🔍&nbsp; Simulators for CPU scheduling, page replacement, paging and the TLB, fork/exec, Peterson’s solution, semaphores and the Banker’s algorithm</td></tr>
<tr><td width="50%" valign="top">🧩&nbsp; Every textbook figure redrawn as a theme-aware diagram; worked examples and a quiz in every chapter</td><td width="50%" valign="top">📝&nbsp; Practice problems with answers, a searchable formula sheet and the course outline linked to the decks</td></tr>
</table>

## 📚 Chapters

9 decks · 347 slides. Each title opens the live deck.

| Ch | Chapter | Syllabus | Slides |
|:--:|---|:--:|:--:|
| **1** | [Introduction](https://ayan-1829.github.io/CSE-309-Operating-System/topics/ch01-introduction.html) | Midterm | 42 |
| **2** | [Operating-System Services](https://ayan-1829.github.io/CSE-309-Operating-System/topics/ch02-operating-system-services.html) | Midterm | 47 |
| **3** | [Processes](https://ayan-1829.github.io/CSE-309-Operating-System/topics/ch03-processes.html) | Midterm | 41 |
| **9** | [Main Memory](https://ayan-1829.github.io/CSE-309-Operating-System/topics/ch09-main-memory.html) | Midterm | 45 |
| **10** | [Virtual Memory](https://ayan-1829.github.io/CSE-309-Operating-System/topics/ch10-virtual-memory.html) | Midterm | 27 |
| **4** | [Threads & Concurrency](https://ayan-1829.github.io/CSE-309-Operating-System/topics/ch04-threads-and-concurrency.html) | Final | 38 |
| **5** | [CPU Scheduling](https://ayan-1829.github.io/CSE-309-Operating-System/topics/ch05-cpu-scheduling.html) | Final | 37 |
| **6** | [Synchronization Tools](https://ayan-1829.github.io/CSE-309-Operating-System/topics/ch06-synchronization-tools.html) | Final | 32 |
| **8** | [Deadlocks](https://ayan-1829.github.io/CSE-309-Operating-System/topics/ch08-deadlocks.html) | Final | 38 |

## ⌨️ Using the slides

| Key | Action |
|:--:|---|
| <kbd>←</kbd> <kbd>→</kbd> · <kbd>Space</kbd> | previous / next slide |
| <kbd>Home</kbd> · <kbd>End</kbd> | first / last slide |
| <kbd>F</kbd> | full screen for teaching |
| <kbd>M</kbd> | slide list |
| ✏️ | draw on any slide |

The address bar shows `#s=N`, so you can link straight to a slide. Light and dark themes follow your system, with a toggle in the header.

## 🚀 Run it locally

No build step, no server: clone the repository and open `index.html` in any modern browser.

```bash
git clone https://github.com/Ayan-1829/CSE-309-Operating-System.git
open CSE-309-Operating-System/index.html      # macOS · use start on Windows, xdg-open on Linux
```

<details>
<summary><b>🛠 Developer notes: folder layout and how the pages are built</b></summary>

```text
Folder layout
-------------
index.html            chapter list (midterm and final syllabus)
topics/*.html         nine slide decks (arrow keys, F full screen, M slide list, pen button to draw)
practice.html         every practice problem with answers
reference.html        searchable cheat sheet (formulas and algorithms)
course.html           summary of the course outline with the lecture plan linked to the decks
404.html              "page not found" page for GitHub Pages
css/style.css         all styling (colour tokens at the top; light and dark themes; OS widgets at the end)
js/core.js            helpers, theme toggle, storage
js/diagram.js         SVG kit used by the figures
js/figs-mid.js, js/figs-final.js     every figure (FIGS[id]) used by <figure class="fig" data-fig="id">
js/demos-mid.js, js/demos-final.js   interactive tools (DEMOS[id]) used by <div data-demo="id">,
                      including the CPU scheduler (schedule()), page replacement (pageReplace()) and Banker's algorithm
js/clang.js           C syntax highlighting
js/quiz.js, js/page.js, js/slides.js, js/annotate.js, js/art.js   quiz, mounting, slide engine, drawing layer, title art
js/analytics.js       shared cookieless analytics tracker (do not edit; same file in every project)
js/course-events.js   course events for the Course analytics Sheet
img/                  logo, favicons, social-share images (img/og/)
robots.txt, sitemap.xml, site.webmanifest   SEO files. The site address is https://ayan-1829.github.io/CSE-309-Operating-System/

```

</details>
