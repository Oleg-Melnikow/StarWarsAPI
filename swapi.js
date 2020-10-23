const filmsTab = document.getElementById("films-tab");
const films = document.getElementById("films");
const peopleTab = document.getElementById("people-tab");
const people = document.getElementById("people");
const planetsTab = document.getElementById("planets-tab");
const planets = document.getElementById("planets");
const paginator = document.querySelector("nav");

//const preloader = document.getElementById("preloader");
const modalExample = document.getElementById("modal-example")

const searchBlock = document.querySelector(".search-block")
const BaseURL = "https://swapi.dev/api/";

const filmsGroup = createCardsBlock("div", "filmsGroup", films)

let backdrop = document.createElement("div");

let urlFormat = (url) => `https${url.substring(4)}`;

function openModal(modal) {
    backdrop.classList.add("modal-backdrop", "fade", "show")
    document.body.append(modal)
    document.body.append(backdrop)
}

if (!localStorage.getItem("Films")) {
    let getStart = fetch(`${BaseURL}films/`);
    getStart.then(data => data.json()).then(res => {
        localStorage.setItem("Films", JSON.stringify(res))
        getFilm(res.results)
    })
} else {
    let getFilms = JSON.parse(localStorage.getItem("Films"));
    getFilm(getFilms.results)
}

function getFilm(result) {
    result.map(function (film) {
        const filmCard = createCardsBlock("div", "card", filmsGroup);
        filmCard.innerHTML = `
            <div class="card-header">
                <h4 class="card-title">${film.title}</h4>
            </div>
            <div class="card-body">
                <p class="card-text">Director: ${film.director}</p>
                <p class="card-text">Producer: ${film.producer}</p>
                <p class="card-text">Release date: ${film.release_date}</p>
                <p class="card-text">Describe: ${film.opening_crawl}</p>
                <button type="button" class="btnInfo btn btn-outline-light btn-sm" 
                        data-toggle="modal" data-target="#modalIn">more info</button>
            </div>         
        `
        const infoBtn = filmCard.querySelector(".btnInfo")
        infoBtn.addEventListener("click", function () {
            modalBlock(film)
        })
    })
}

function modalBlock(film) {
    let modal = modalExample.cloneNode(true);
    document.body.classList.add("modal-open");
    modal.classList.remove("fade");
    modal.style.display = "block";
    modal.querySelector(".modal-title").textContent = film.title
    modal.querySelector(".modal-body").innerHTML = `
            <p class="card-text">Director: ${film.director}</p>
            <p class="card-text">Producer: ${film.producer}</p>
            <p class="card-text">Release date: ${film.release_date}</p>
            <p class="card-text">Describe: ${film.opening_crawl}</p>
            <p class="card-text">Created: ${transformDate(film.created)}</p>
            <p class="card-text">Edited: ${transformDate(film.edited)}</p>
    `
    cardCategory(film, "starships", modal)
    cardCategory(film, "characters", modal, modalPeople, closeModal);
    cardCategory(film, "species", modal);
    cardCategory(film, "planets", modal, modalPlanet, closeModal);
    cardCategory(film, "vehicles", modal);

    btnClose(modal, closeModal)

    document.addEventListener('keydown', event => {
        if (event.code === 'Escape') closeModal()
    });

    function closeModal() {
        modal.remove();
        backdrop.remove();
        document.body.classList.remove("modal-open")
    }

    openModal(modal)
}

function searchElement(root, searchRoot){
    let search = searchBlock.cloneNode(true);
    search.classList.add("d-flex")
    if(!root.previousElementSibling) root.before(search)
    const searchBtn = search.querySelector("#search")
    const inputSearch = search.querySelector(".input-search");
    searchBtn.addEventListener("click", () => searchRoot(inputSearch))

    document.addEventListener("keydown", function (event) {
        if (event.code === "Enter") {
            searchRoot(inputSearch)
        }
    });
}

searchElement(filmsGroup, searchFilm)

function searchFilm(inputSearch) {
    let getFilms = JSON.parse(localStorage.getItem("Films"));
    if (inputSearch.value !== "") {
        filmsGroup.innerHTML = "";
        getFilm(getFilms.results.filter(film => film.title.toLowerCase() === inputSearch.value.toLowerCase()))
    } else {
        filmsGroup.innerHTML = "";
        getFilm(getFilms.results)
    }
    inputSearch.value = "";
}

filmsTab.addEventListener("click", async function () {
    let getFilms = JSON.parse(localStorage.getItem("Films"));
    filmsGroup.innerHTML = "";
    getFilm(getFilms.results)
})

const peopleGroup = createCardsBlock("div", "peopleGroup", people);

let getCardPeople = (people) => {
    let div = document.createElement("div");
    div.innerHTML = `<p class="card-text">Birth year: ${people.birth_year}</p>
                <p class="card-text">Gender: ${people.gender}</p>
                <p class="card-text">Height: ${people.height}</p>
                <p class="card-text">Mass: ${people.mass}</p>
                <p class="card-text">Eye color: ${people.eye_color}</p>
                <p class="card-text">Hair color: ${people.hair_color}</p>
                <p class="card-text">Skin color: ${people.skin_color}</p>`
    return div
}

function rootTab(tab, root, cardGroup, getCardRoot, modalRoot){
    tab.addEventListener("click", async function () {
        let res = null
        let pageId = 1
        searchElement(cardGroup, searchRoot)
        if(!JSON.parse(localStorage.getItem(root))){
            let response = await fetch(`${BaseURL}${root}/`);
            res = await response.json();
            getCard(res.results, getCardRoot, cardGroup, modalRoot)
            localStorage.setItem(root,JSON.stringify([{id, value: res}]))
            console.log(JSON.parse(localStorage.getItem(root)))
        } else{
            res =  JSON.parse(localStorage.getItem(root))[0].value
        }

        getCard(res.results, getCardRoot, cardGroup, modalRoot)

        let nav = paginator.cloneNode(true);
        nav.style.display = "block";
        if(!cardGroup.nextElementSibling) cardGroup.after(nav)
        const nextBtn = nav.querySelector("#next");
        const prevBtn = nav.querySelector("#prev")
        pagination(res, nextList, nextBtn, "people/");
        disabledBtn(res.previous, prevBtn);
        async function nextList(url, id) {
            let roots = JSON.parse(localStorage.getItem(root))
            let exist = roots.some(el => el.id === id)
            if(!exist){
                let response = await fetch(url);
                res = await response.json();
                let local = JSON.parse(localStorage.getItem(root))
                local = [...local, {id, value: res}]
                localStorage.setItem(root,JSON.stringify(local))
            } else {
                res = roots.find(el => el.id === id).value
            }
            pageId = id
            cardGroup.innerHTML = "";
            disabledBtn(res.next, nextBtn);
            disabledBtn(res.previous, prevBtn);
            getCard(res.results, getCardRoot, cardGroup, modalRoot)
        }
        nextBtn.addEventListener("click", () => nextList(urlFormat(res.next), pageId + 1))
        prevBtn.addEventListener("click", () => nextList(urlFormat(res.previous), pageId - 1))
        function searchRoot(inputSearch) {
            if (inputSearch.value !== "") {
                let getPerson = res.results.filter(root => root.name.toLowerCase() === inputSearch.value.toLowerCase())
                getCard(getPerson, getCardRoot, cardGroup, modalRoot)
            } else {
                getCard(res.results, getCardRoot, cardGroup, modalRoot)
            }
            inputSearch.value = "";
        }
    })
}

rootTab(peopleTab, "people", peopleGroup, getCardPeople, modalPeople)

function modalPeople(people) {
    let modal = modalExample.cloneNode(true);
    document.body.classList.add("modal-open");
    modal.classList.remove("fade");
    modal.style.display = "block";
    modal.querySelector(".modal-title").textContent = people.name
    modal.querySelector(".modal-body").innerHTML = `
            <p class="card-text">Birth year: ${people.birth_year}</p>
            <p class="card-text">Gender: ${people.gender}</p>
            <p class="card-text">Height: ${people.height}</p>
            <p class="card-text">Mass: ${people.mass}</p>
            <p class="card-text">Eye color: ${people.eye_color}</p>
            <p class="card-text">Hair color: ${people.hair_color}</p>
            <p class="card-text">Skin color: ${people.skin_color}</p>
            <div class="list-group" id="films" style="display: none">Films:</div>
    `
    cardCategory(people, "vehicles", modal);
    cardCategory(people, "starships", modal);

    filmModal(people, modal, closeModal)
    btnClose(modal, closeModal)

    document.addEventListener('keydown', event => {
        if (event.code === 'Escape') closeModal()
    });

    function closeModal() {
        modal.remove();
        backdrop.remove();
        document.body.classList.remove("modal-open")
    }

    openModal(modal)
}

const cardGroup = createCardsBlock("div", "cardGroup", planets);

let getCardPlanets = (planet) => {
    let div = document.createElement("div");
    div.innerHTML = `<p class="card-text">Climate: ${planet.climate}</p>
                     <p class="card-text">Diameter: ${planet.diameter}</p>
                     <p class="card-text">Population: ${planet.population}</p>
                     <p class="card-text">Terrain: ${planet.terrain}</p>
                     <p class="card-text">Orbital period: ${planet.orbital_period}</p>
                    `
    return div
}

rootTab(planetsTab, "planets", cardGroup, getCardPlanets, modalPlanet)

function getCard(result, getCardTab, cardGroup, modal) {
    cardGroup.innerHTML = "";
    result.map(el => {
        const card = createCardsBlock("div", "card", cardGroup);
        card.innerHTML = `
            <div class="card-header">
                <h4 class="card-title">${el.name}</h4>
            </div>
            <div class="card-body">
                <button type="button" class="btnInfo btn btn-outline-light btn-sm" 
                        data-toggle="modal" data-target="#modalIn">more info</button>
            </div>         
        `
        const infoBtn = card.querySelector(".btnInfo")
        infoBtn.addEventListener("click", function () {
            modal(el)
        })
        infoBtn.before(getCardTab(el))
    })
}

function cardCategory(category, property, modal, modalRoot, closeModal) {
    if (category[property].length !== 0) {
        let list = document.createElement("div")
        list.classList.add("list-group")
        list.id = property
        list.textContent = `${upperCase(property)}:`
        modal.querySelector(".modal-body").append(list)
        list.style.display = "block";
        category[property].map(v => fetch(urlFormat(v)).then(data => data.json())
            .then(function (res) {
                let nameProperty = document.createElement("p");
                nameProperty.textContent = `${res.name}`;
                nameProperty.classList.add("list-group-item");
                nameProperty.addEventListener("click", () => {
                    closeModal(modal)
                    modalRoot(res)
                });
                list.append(nameProperty);
            })
        )
    }
}

function pagination(result, nextList, nextBtn, root) {
    let length = Math.ceil(result.count / 10);
    for (let i = 1; i <= length; i++) {
        let list = document.createElement("li");
        list.classList.add("page-item", "number");
        list.innerHTML = `<button class="page-link bg-dark text-white">${i}</button>`
        list.querySelector("button").addEventListener("click", () => nextList(`${BaseURL}${root}?page=${i}`, i))
        let l = nextBtn.parentElement.previousSibling.textContent
        if (+l < length) nextBtn.parentNode.before(list);
    }
}

function disabledBtn(next, button) {
    if (next === null) {
        button.disabled = true
        button.parentNode.classList.add("disabled");
    } else {
        button.disabled = false
        button.parentNode.classList.remove("disabled");
    }
}

function modalPlanet(planet) {
    let modal = modalExample.cloneNode(true)
    document.body.classList.add("modal-open");
    modal.classList.remove("fade");
    modal.style.display = "block";
    modal.querySelector(".modal-title").textContent = planet.name
    modal.querySelector(".modal-body").innerHTML = `
             <p class="card-text">Climate: ${planet.climate}</p>
             <p class="card-text">Diameter: ${planet.diameter}</p>
             <p class="card-text">Population: ${planet.population}</p>
             <p class="card-text">Terrain: ${planet.terrain}</p>
             <p class="card-text">Created: ${transformDate(planet.created)}</p>
             <p class="card-text">Edited: ${transformDate(planet.edited)}</p>
             <p class="card-text">Gravity: ${planet.gravity}</p>
             <p class="card-text">Orbital period: ${planet.orbital_period}</p>
             <p class="card-text">Rotation period: ${planet.rotation_period}</p>
             <p class="card-text">Surface water: ${planet.surface_water}</p>
             <div class="list-group" id="films" style="display: none">Films:</div>
    `
    
    cardCategory(planet, "residents", modal, modalPeople, closeModal);

    filmModal(planet, modal, closeModal)
    btnClose(modal, closeModal)

    document.addEventListener('keydown', event => {
        if (event.code === 'Escape') closeModal()
    });

    function closeModal() {
        modal.remove();
        backdrop.remove();
        document.body.classList.remove("modal-open")
    }

    openModal(modal)
}

function filmModal(listName, modal, closeModal){
    if (listName.films.length !== 0) {
        let list = modal.querySelector(`#films`)
        list.style.display = "block"
        listName.films.map(function (film) {
            let filmElement = document.createElement("p")
            let getFilm = JSON.parse(localStorage.getItem("Films")).results.find(f => f.url === film)
            filmElement.textContent = getFilm.title
            filmElement.classList.add("list-group-item")
            filmElement.setAttribute("data-dismiss", "modal")
            list.append(filmElement);
            filmElement.addEventListener("click", function () {
                console.log(getFilm.title, getFilm)
                closeModal(modal)
                modalBlock(getFilm)
            })
        })
    }
}

function btnClose(modal, closeModal) {
    modal.querySelector(".close").addEventListener("click", closeModal)
    modal.querySelector(".exit").addEventListener("click", closeModal)
}

function createCardsBlock(element, className, parent) {
    const person = document.createElement(element);
    person.classList.add(className);
    parent.append(person);
    return person;
}

function transformDate(date) {
    let d = new Date(Date.parse(date));
    let year = d.getFullYear(), // Конвертируем метку в год
        month = ('0' + (d.getMonth() + 1)).slice(-2), // Конвертируем метку в месяц
        day = ('0' + d.getDate()).slice(-2), // Конвертируем метку в число месяца
        hours = d.getHours() - 3, // Конвертируем метку в часы
        min = ('0' + d.getMinutes()).slice(-2), // Конвертируем метку в минуты
        time;
    time = `${year}-${month}-${day}, ${hours}: ${min}`;
    return time;
}

function upperCase(str) {
    if (!str) return str;
    return str[0].toUpperCase() + str.slice(1);
}