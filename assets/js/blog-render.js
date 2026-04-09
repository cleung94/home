document.addEventListener("DOMContentLoaded", () => {
	const blogGrid = document.getElementById("blogGrid");
	const pagination = document.getElementById("pagination");
	const blogEmpty = document.getElementById("blogEmpty");

	if (!blogGrid || !pagination || typeof BLOG_POSTS === "undefined") return;

	const POSTS_PER_PAGE = 10;
	const activeTag = (document.body.dataset.blogTag || "all").toLowerCase();
	let currentPage = 1;

	function normalizeTag(tag) {
		return String(tag || "").trim().toLowerCase();
	}

	function getFilteredPosts() {
		if (activeTag === "all") return BLOG_POSTS;

		return BLOG_POSTS.filter((post) => {
			if (!post.tag) return false;

			if (Array.isArray(post.tag)) {
				return post.tag.map(normalizeTag).includes(activeTag);
			}

			return normalizeTag(post.tag) === activeTag;
		});
	}

	function createBlogCard(post) {
		return `
			<a class="blog-card" href="${post.slug}">
				<div class="blog-card-image">
					<img src="${post.image}" alt="${post.title}">
					${post.tagLabel ? `<span class="blog-tag-badge">${post.tagLabel}</span>` : ""}
				</div>

				<div class="blog-card-body">
					<p class="blog-card-meta">${post.date || ""}</p>
					<h3 class="blog-card-title">${post.title}</h3>
					<p class="blog-card-excerpt">${post.excerpt || ""}</p>
					<span class="blog-card-link">Read More</span>
				</div>
			</a>
		`;
	}

	function createPageButton(label, page, isActive = false, isDisabled = false, isEllipsis = false) {
		const button = document.createElement("a");
		button.href = "#";
		button.className = "page-btn";
		button.textContent = label;

		if (isActive) button.classList.add("active");
		if (isDisabled) button.classList.add("disabled");
		if (isEllipsis) button.classList.add("ellipsis");

		if (!isDisabled && !isEllipsis) {
			button.addEventListener("click", (e) => {
				e.preventDefault();
				currentPage = page;
				renderBlog();
				window.scrollTo({
					top: blogGrid.offsetTop - 80,
					behavior: "smooth"
				});
			});
		}

		return button;
	}

	function getVisiblePages(totalPages, currentPage) {
		if (totalPages <= 7) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		const pages = [];

		if (currentPage <= 4) {
			pages.push(1, 2, 3, 4, 5, "...", totalPages);
		} else if (currentPage >= totalPages - 3) {
			pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
		} else {
			pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
		}

		return pages;
	}

	function renderPagination(totalPosts) {
		const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
		pagination.innerHTML = "";

		const wrapper = document.createElement("div");
		wrapper.className = "pagination";

		wrapper.appendChild(
			createPageButton("<", currentPage - 1, false, currentPage === 1)
		);

		const visiblePages = getVisiblePages(totalPages, currentPage);

		visiblePages.forEach((item) => {
			if (item === "...") {
				wrapper.appendChild(
					createPageButton("...", 0, false, true, true)
				);
			} else {
				wrapper.appendChild(
					createPageButton(String(item), item, item === currentPage, false)
				);
			}
		});

		wrapper.appendChild(
			createPageButton(">", currentPage + 1, false, currentPage === totalPages)
		);

		pagination.appendChild(wrapper);
	}

	function renderBlog() {
		const filteredPosts = getFilteredPosts();
		const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));

		if (currentPage > totalPages) currentPage = totalPages;
		if (currentPage < 1) currentPage = 1;

		if (!filteredPosts.length) {
			blogGrid.innerHTML = "";
			blogGrid.style.display = "none";
			if (blogEmpty) blogEmpty.style.display = "block";
			renderPagination(0);
			return;
		}

		blogGrid.style.display = "grid";
		if (blogEmpty) blogEmpty.style.display = "none";

		const start = (currentPage - 1) * POSTS_PER_PAGE;
		const end = start + POSTS_PER_PAGE;
		const postsToShow = filteredPosts.slice(start, end);

		blogGrid.innerHTML = postsToShow.map(createBlogCard).join("");
		renderPagination(filteredPosts.length);
	}

	renderBlog();
});
