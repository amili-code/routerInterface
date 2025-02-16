function sliderUpdate(page) {
    const element = document.getElementById(`${page}-title`)
    element.classList.remove()
    element.classList.add("nav-link")
    element.classList.add("active")
    element.classList.add("bg-gradient-dark")
    element.classList.add("text-white")
    return
}