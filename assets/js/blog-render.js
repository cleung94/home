(function () {
  const TAG_INFO = {
    all: {
      title: "My Blog",
      subtitle: "A collection of posts about technology, healthcare, restaurants, and hobbies."
    },
    technology: {
      title: "Technology",
      subtitle: "Posts about systems, troubleshooting, projects, and technical growth."
    },
    healthcare: {
      title: "Healthcare",
      subtitle: "Posts about patient care, learning experiences, and reflections from healthcare work."
    },
    restaurant: {
      title: "Restaurant",
      subtitle: "Posts and reviews focused on food, atmosphere, service, and overall dining experience."
    },
    hobbies: {
      title: "Hobbies",
      subtitle: "Posts about interests, balance, games, creativity, and personal enjoyment."
    }
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function buildCard(post) {
    return `
      <a href="${escapeHtml(post.slug)}" class="blog-card" data-category="${escapeHtml(post.tag)}">
        <div class="blog-card-image">
          <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.tagLabel)} post cover">
          <span class="blog-tag-badge">${escapeHtml(post.tagLabel)}</span>
        </div>
        <div class="blog-card-body">
          <div class="blog-card-meta">${escapeHtml(post.date)}</div>
          <h3 class="blog-card-title">${escapeHtml(post.title)}</h3>
          <p class="blog-card-excerpt">${escapeHtml(post.excerpt)}</p>
          <span class="blog-card-link">Read Post →</span>
        </div>
      </a>
    `;
  }

  function renderPosts(posts, container) {
    if (!container) return;
    container.innerHTML = posts.map(buildCard).join("");
  }

  function setHero(tag) {
    const titleEl = document.querySelector("[data-blog-title]");
    const subtitleEl = document.querySelector("[data-blog-subtitle]");
    const info = TAG_INFO[tag] || TAG_INFO.all;

    if (titleEl) titleEl.textContent = info.title;
    if (subtitleEl) subtitleEl.textContent = info.subtitle;
  }

  function getPageTag() {
    const bodyTag = document.body.dataset.blogTag;
    if (bodyTag) return bodyTag.toLowerCase();

    const params = new URLSearchParams(window.location.search);
    const queryTag = params.get("tag");
    return queryTag ? queryTag.toLowerCase() : "all";
  }

  function initAllBlogPage() {
    const grid = document.getElementById("blogGrid");
    const emptyState = document.getElementById("blogEmpty");
    const filterButtons = document.querySelectorAll(".blog-chip");

    if (!grid) return;

    renderPosts(window.BLOG_POSTS, grid);

    filterButtons.forEach((button) => {
      button.addEventListener("click", function (e) {
        e.preventDefault();

        const filter = this.dataset.filter || "all";
        const filtered =
          filter === "all"
            ? window.BLOG_POSTS
            : window.BLOG_POSTS.filter((post) => post.tag === filter);

        filterButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        renderPosts(filtered, grid);

        if (emptyState) {
          emptyState.style.display = filtered.length ? "none" : "block";
        }
      });
    });
  }

  function initTagPage() {
    const grid = document.getElementById("tagBlogGrid");
    const emptyState = document.getElementById("tagBlogEmpty");
    if (!grid) return;

    const tag = getPageTag();
    setHero(tag);

    const filtered =
      tag === "all"
        ? window.BLOG_POSTS
        : window.BLOG_POSTS.filter((post) => post.tag === tag);

    renderPosts(filtered, grid);

    if (emptyState) {
      emptyState.style.display = filtered.length ? "none" : "block";
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initAllBlogPage();
    initTagPage();
  });
})();
