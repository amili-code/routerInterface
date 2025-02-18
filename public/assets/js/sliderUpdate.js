let activeLiElement = 'dashboard';

function sliderUpdate(page) {
    const element = document.getElementById(`${page}-title`)
    let classListe = document.getElementById(`${activeLiElement}-title`).classList
    element.classList = []
    classListe.forEach(classsName => {
        element.classList.add(classsName)
    })
    activeLiElement = page
    sliderClassRestart(page)
    return
}

function navUpdate(page) {
    document.getElementById("page-navbar").textContent = page
    document.getElementById("page-navbare").textContent = `صفحه ی ${page}`
}




function sliderClassRestart(page) {
    let idListest = ["dashboard-title", "routers-title", "limitation-title"]
    const elem = document.getElementById("get-theme-class")
    idListest.forEach(id => {

        const element = document.getElementById(id)
        if(`${page}-title` != id)
            element.classList = elem.classList
    })
}