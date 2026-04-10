document.addEventListener("DOMContentLoaded", () => {
	const projectsGrid = document.getElementById("projectsGrid");
	const pagination = document.getElementById("projectsPagination");
	const projectsEmpty = document.getElementById("projectsEmpty");
	const filterButtons = document.querySelectorAll("[data-project-filters] [data-filter]");

	if (!projectsGrid || !pagination || typeof PROJECTS === "undefined") return;

	const PROJECTS_PER_PAGE = 10;
	let currentPage = 1;
	let activeFilter = "all";

	function normalizeTag(tag) {
		return String(tag || "").trim().toLowerCase();
	}

	function getFilteredProjects() {
		if (activeFilter === "all") return PROJECTS;

		return PROJECTS.filter((project) => {
			if (!project.tag) return false;

			if (Array.isArray(project.tag)) {
				return project.tag.map(normalizeTag).includes(activeFilter);
			}

			return normalizeTag(project.tag) === activeFilter;
		});
	}

	function escapeHtml(value) {
		return String(value ?? "")
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

	function createMetaTags(project) {
		const tags = [];

		if (project.tagLabel) {
			const categoryClass = normalizeTag(project.tag);
			const categoryClassMap = {
				technology: "tag-tech",
				data: "tag-data",
				healthcare: "tag-health",
				creative: "tag-creative"
			};

			tags.push(
				`<span class="meta-tag ${categoryClassMap[categoryClass] || "tag-status"}">${escapeHtml(project.tagLabel)}</span>`
			);
		}

		if (Array.isArray(project.status)) {
			project.status.forEach((item) => {
				tags.push(`<span class="meta-tag tag-status">${escapeHtml(item)}</span>`);
			});
		} else if (project.status) {
			tags.push(`<span class="meta-tag tag-status">${escapeHtml(project.status)}</span>`);
		}

		return tags.join("");
	}

	function createTools(project) {
		if (!Array.isArray(project.tools) || !project.tools.length) return "";

		return `
			<div class="project-tools">
				${project.tools.map((tool) => `<span class="tool-pill">${escapeHtml(tool)}</span>`).join("")}
			</div>
		`;
	}

	function createProjectCard(project) {
		const featuredClass = project.featured ? " featured-card" : "";
		const categoryClass = normalizeTag(project.tag || "");

		return `
			<article class="project-card${featuredClass} ${categoryClass}" data-category="${escapeHtml(categoryClass)}">
				<div class="${project.featured ? "featured-meta" : "project-meta"}">
					${createMetaTags(project)}
				</div>
				${project.date ? `<p class="project-card-date">${escapeHtml(project.date)}</p>` : ""}
				<h3>${escapeHtml(project.title)}</h3>
				<p>${escapeHtml(project.excerpt || "")}</p>
				${createTools(project)}
				<a href="${escapeHtml(project.slug)}" class="project-link">
					View project details <span>&rarr;</span>
				</a>
			</article>
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
				renderProjects();
				window.scrollTo({
					top: projectsGrid.offsetTop - 80,
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

	function renderPagination(totalProjects) {
		const totalPages = Math.max(1, Math.ceil(totalProjects / PROJECTS_PER_PAGE));
		pagination.innerHTML = "";

		const wrapper = document.createElement("div");
		wrapper.className = "pagination";

		wrapper.appendChild(
			createPageButton("<", currentPage - 1, false, currentPage === 1)
		);

		const visiblePages = getVisiblePages(totalPages, currentPage);

		visiblePages.forEach((item) => {
			if (item === "...") {
				wrapper.appendChild(createPageButton("...", 0, false, true, true));
			} else {
				wrapper.appendChild(createPageButton(String(item), item, item === currentPage, false));
			}
		});

		wrapper.appendChild(
			createPageButton(">", currentPage + 1, false, currentPage === totalPages)
		);

		pagination.appendChild(wrapper);
	}

	function updateActiveFilters() {
		filterButtons.forEach((button) => {
			const filter = normalizeTag(button.dataset.filter);
			button.classList.toggle("active", filter === activeFilter);
		});
	}

	function renderProjects() {
		const filteredProjects = getFilteredProjects();
		const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE));

		if (currentPage > totalPages) currentPage = totalPages;
		if (currentPage < 1) currentPage = 1;

		if (!filteredProjects.length) {
			projectsGrid.innerHTML = "";
			projectsGrid.style.display = "none";
			if (projectsEmpty) projectsEmpty.style.display = "block";
			renderPagination(0);
			updateActiveFilters();
			return;
		}

		projectsGrid.style.display = "grid";
		if (projectsEmpty) projectsEmpty.style.display = "none";

		const start = (currentPage - 1) * PROJECTS_PER_PAGE;
		const end = start + PROJECTS_PER_PAGE;
		const projectsToShow = filteredProjects.slice(start, end);

		projectsGrid.innerHTML = projectsToShow.map(createProjectCard).join("");
		renderPagination(filteredProjects.length);
		updateActiveFilters();
	}

	filterButtons.forEach((button) => {
		button.addEventListener("click", () => {
			activeFilter = normalizeTag(button.dataset.filter || "all");
			currentPage = 1;
			renderProjects();
		});
	});

	renderProjects();
});
