const POSTS_PER_PAGE = 10;

let currentPosts = [];
let currentContainer = null;
let currentPage = 1;

function escapeHtml(str) {
	return String(str ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function createCard(post) {
	return `
		<a href="${escapeHtml(post.slug)}" class="blog-card">
			<div class="blog-card-image">
				<img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}">
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

function renderPagination() {
	const container = document.getElementById("pagination");
	if (!container) return;

	const totalPages = Math.ceil(currentPosts.length / POSTS_PER_PAGE);

	if (totalPages <= 1) {
		container.innerHTML = "";
		return;
	}

	let html = `<div class="pagination">`;

	if (currentPage > 1) {
		html += `<a href="#" class="page-btn prev-btn" data-page="${currentPage - 1}">Previous</a>`;
	}

	for (let i = 1; i <= totalPages; i++) {
		html += `<a href="#" class="page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</a>`;
	}

	if (currentPage < totalPages) {
		html += `<a href="#" class="page-btn next-btn" data-page="${currentPage + 1}">Next</a>`;
	}

	html += `</div>`;

	container.innerHTML = html;

	container.querySelectorAll(".page-btn").forEach((button) => {
		button.addEventListener("click", function (e) {
			e.preventDefault();
			const page = parseInt(this.dataset.page, 10);
			if (!Number.isNaN(page)) {
				renderPage(page);
				window.scrollTo({ top: 0, behavior: "smooth" });
			}
		});
	});
}

function renderEmptyState(show) {
	const emptyAll = document.getElementById("blogEmpty");
	const emptyTag = document.getElementById("tagBlogEmpty");

	if (emptyAll) {
		emptyAll.style.display = show ? "block" : "none";
	}
	if (emptyTag) {
		emptyTag.style.display = show ? "block" : "none";
	}
}

function renderPage(page) {
	currentPage = page;

	const start = (page - 1) * POSTS_PER_PAGE;
	const end = start + POSTS_PER_PAGE;
	const postsToRender = currentPosts.slice(start, end);

	if (!currentContainer) return;

	currentContainer.innerHTML = postsToRender.map(createCard).join("");

	renderEmptyState(postsToRender.length === 0);
	renderPagination();
}

function getFilteredPosts(tag) {
	if (!Array.isArray(window.BLOG_POSTS)) return [];

	if (tag === "all") {
		return [...window.BLOG_POSTS];
	}

	return window.BLOG_POSTS.filter((post) => {
		return String(post.tag || "").toLowerCase() === String(tag).toLowerCase();
	});
}

function initBlog() {
	const tag = document.body.dataset.blogTag || "all";

	const grid =
		document.getElementById("blogGrid") ||
		document.getElementById("tagBlogGrid");

	if (!grid) return;

	currentContainer = grid;
	currentPosts = getFilteredPosts(tag);

	renderPage(1);

	const filterButtons = document.querySelectorAll(".blog-chip");

	if (filterButtons.length) {
		filterButtons.forEach((button) => {
			button.addEventListener("click", function (e) {
				e.preventDefault();

				const filter = this.dataset.filter || "all";

				filterButtons.forEach((btn) => btn.classList.remove("active"));
				this.classList.add("active");

				currentPosts = getFilteredPosts(filter);
				renderPage(1);
			});
		});
	}
}

document.addEventListener("DOMContentLoaded", initBlog);
