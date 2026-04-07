const POSTS_PER_PAGE = 10

let currentPosts = []
let currentContainer = null
let currentPage = 1

function createCard(post){
return `
<a href="${post.slug}" class="blog-card">
<div class="blog-card-image">
<img src="${post.image}" alt="">
<span class="blog-tag-badge">${post.tagLabel}</span>
</div>

<div class="blog-card-body">
<div class="blog-card-meta">${post.date}</div>
<h3 class="blog-card-title">${post.title}</h3>
<p class="blog-card-excerpt">${post.excerpt}</p>
<span class="blog-card-link">Read Post →</span>
</div>
</a>
`
}

function renderPage(page){

currentPage = page

const start = (page-1) * POSTS_PER_PAGE
const end = start + POSTS_PER_PAGE

const posts = currentPosts.slice(start,end)

currentContainer.innerHTML = posts.map(createCard).join("")

renderPagination()
}

function renderPagination(){

const totalPages = Math.ceil(currentPosts.length / POSTS_PER_PAGE)

const container = document.getElementById("pagination")
if(!container) return

let html = `<div class="pagination">`

if(currentPage > 1){
html += `<a href="#" class="page-btn prev-btn">Previous</a>`
}

for(let i=1;i<=totalPages;i++){
html += `<a href="#" class="page-btn ${i===currentPage?"active":""}" data-page="${i}">${i}</a>`
}

if(currentPage < totalPages){
html += `<a href="#" class="page-btn next-btn">Next</a>`
}

html += `</div>`

container.innerHTML = html

document.querySelectorAll(".page-btn[data-page]").forEach(btn=>{
btn.addEventListener("click",(e)=>{
e.preventDefault()
renderPage(parseInt(btn.dataset.page))
})
})

const prevBtn = document.querySelector(".prev-btn")
if(prevBtn){
prevBtn.addEventListener("click",(e)=>{
e.preventDefault()
renderPage(currentPage-1)
})
}

const nextBtn = document.querySelector(".next-btn")
if(nextBtn){
nextBtn.addEventListener("click",(e)=>{
e.preventDefault()
renderPage(currentPage+1)
})
}

}

function initBlog(){

const tag = document.body.dataset.blogTag || "all"

const grid =
document.getElementById("blogGrid") ||
document.getElementById("tagBlogGrid")

if(!grid) return

currentContainer = grid

if(tag === "all"){
currentPosts = BLOG_POSTS
}else{
currentPosts = BLOG_POSTS.filter(post => post.tag === tag)
}

renderPage(1)
}

document.addEventListener("DOMContentLoaded",initBlog)
