document.addEventListener("DOMContentLoaded", () => {
	const blogGrid = document.getElementById("blogGrid");
	const pagination = document.getElementById("pagination");
	const blogEmpty = document.getElementById("blogEmpty");

	if (!blogGrid || typeof BLOG_POSTS === "undefined") return;

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
			<a class="blog-card" href="${post.url}">
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

	function renderPosts(posts, page) {
		const startIndex = (page - 1) * POSTS_PER_PAGE;
		const endIndex = startIndex + POSTS_PER_PAGE;
		const pagePosts = posts.slice(startIndex, endIndex);

		blogGrid.innerHTML = pagePosts.map(createBlogCard).join("");
	}

	function buildPageButton(label, page, isActive = false, isDisabled = false) {
		const button = document.createElement("a");
		button.href = "#";
		button.className = "page-btn";

		if (isActive) button.classList.add("active");
		if (isDisabled) button.classList.add("disabled");

		button.textContent = label;

		if (!isDisabled) {
			button.addEventListener("click", (e) => {
				e.preventDefault();
				currentPage = page;
				render();
				window.scrollTo({
					top: blogGrid.offsetTop - 80,
					behavior: "smooth"
				});
			});
		}

		return button;
	}

	function renderPagination(totalPosts) {
		const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
		pagination.innerHTML = "";

		if (totalPages <= 1) return;

		const wrapper = document.createElement("div");
		wrapper.className = "pagination";

		wrapper.appendChild(
			buildPageButton("<", currentPage - 1, false, currentPage === 1)
		);

		for (let i = 1; i <= totalPages; i++) {
			wrapper.appendChild(
				buildPageButton(String(i), i, i === currentPage, false)
			);
		}

		wrapper.appendChild(
			buildPageButton(">", currentPage + 1, false, currentPage === totalPages)
		);

		pagination.appendChild(wrapper);
	}

	function render() {
		const filteredPosts = getFilteredPosts();
		const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));

		if (currentPage > totalPages) currentPage = totalPages;

		blogEmpty.style.display = filteredPosts.length ? "none" : "block";
		blogGrid.style.display = filteredPosts.length ? "grid" : "none";

		if (!filteredPosts.length) {
			pagination.innerHTML = "";
			return;
		}

		renderPosts(filteredPosts, currentPage);
		renderPagination(filteredPosts.length);
	}

	render();
});
