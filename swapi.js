const filmsTab = document.getElementById("films-tab");
const films = document.getElementById("films");
const peopleTab = document.getElementById("people-tab");
const people = document.getElementById("people");
const planetsTab = document.getElementById("planets-tab");
const planets = document.getElementById("planets");
const paginator = document.querySelector("nav");

const preloader = document.getElementById("preloader");
const inputSearch = document.getElementById("input-search");
const modalExample = document.getElementById("modal-example")

const searchBtn = document.getElementById("search")
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
            <div id="characters" class="dropdown dropright"></div>
            <div id="vehicles" class="list-group" style="display: none"> Vehicles:</div>
            <div id="starships" class="dropdown dropright"></div>
    `
    dropdown(film, "starships", modal)
    dropdown(film, "characters", modal);
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

document.addEventListener("keydown", function (event) {
    if (event.code === "Enter") {
        searchFilm()
    }
});

searchBtn.addEventListener("click", () => searchFilm())

function searchFilm() {
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

function getPerson(res) {
    peopleGroup.innerHTML = "";
    res.map(function (people) {
        const peopleCard = createCardsBlock("div", "card", peopleGroup);
        peopleCard.innerHTML = `
            <div class="card-header">
                <h4 class="card-title">${people.name}</h4>
            </div>
            <div class="card-body">
                <p class="card-text">Birth year: ${people.birth_year}</p>
                <p class="card-text">Gender: ${people.gender}</p>
                <p class="card-text">Height: ${people.height}</p>
                <p class="card-text">Mass: ${people.mass}</p>
                <p class="card-text">Eye color: ${people.eye_color}</p>
                <p class="card-text">Hair color: ${people.hair_color}</p>
                <p class="card-text">Skin color: ${people.skin_color}</p>
                <button type="button" class="btnInfo btn btn-outline-light btn-sm" 
                        data-toggle="modal" data-target="#modalIn">more info</button>
            </div>         
        `
        const infoBtn = peopleCard.querySelector(".btnInfo")
        infoBtn.addEventListener("click", function () {
            modalPeople(people)
        })
    })
}

peopleTab.addEventListener("click", async function () {
    /*if (!localStorage.getItem("People")) {*/
    let response = await fetch(`${BaseURL}people/`);
    let res = await response.json();
    localStorage.setItem("People", JSON.stringify(res))
    getPerson(res.results)
    let nav = paginator.cloneNode(true);
    nav.style.display = "block";
    if(!peopleGroup.previousElementSibling) peopleGroup.before(nav)
    const nextBtn = nav.querySelector("#next");
    const prevBtn = nav.querySelector("#prev")
    pagination(res, nextList, nextBtn, prevBtn, "people/");
    disabledBtn(res.previous, prevBtn);

    async function nextList(url) {
        console.log(res.next, res.count, res.previous);
        peopleGroup.innerHTML = "";
        urlFormat(url)
        let response = await fetch(`${url}`);
        res = await response.json();

        disabledBtn(res.next, nextBtn);
        disabledBtn(res.previous, prevBtn);
        getPerson(res.results);
    }

    /*else {
    peopleGroup.innerHTML = "";
    let getPeople = JSON.parse(localStorage.getItem("People"));
    getPerson(getPeople.results)
}*/

})

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
            <div id="vehicles" class="list-group" style="display: none"> Vehicles:</div>
            <div class="list-group" id="films" style="display: none">Films:</div>
            <div class="list-group" id="starships" style="display: none">Starships:</div>
    `
    cardCategory(people, "vehicles", modal);
    cardCategory(people, "starships", modal);

    if (people.films.length !== 0) {
        let list = modal.querySelector("#films")
        list.style.display = "block"
        people.films.map(function (film) {
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

planetsTab.addEventListener("click", async function () {
    let response = await fetch(`${BaseURL}planets/`);
    let result = await response.json();

    let nav = paginator.cloneNode(true);
    nav.style.display = "block";
    if(cardGroup.previousElementSibling.tagName !== "NAV") cardGroup.before(nav)

    const nextBtn = nav.querySelector("#next");
    const prevBtn = nav.querySelector("#prev")
    pagination(result, nextList, nextBtn, prevBtn, "planets/")

    preloader.style.display = "none";
    preloader.classList.remove("d-flex");
    disabledBtn(result.previous, prevBtn);

    async function nextList(url) {
        console.log(result.next, result.count, result.previous);
        cardGroup.innerHTML = "";
        preloader.classList.add("d-flex");
        preloader.style.display = "block";
        let response = await fetch(`${url}`);
        result = await response.json();
        preloader.style.display = "none";
        preloader.classList.remove("d-flex");
        disabledBtn(result.next, nextBtn);
        disabledBtn(result.previous, prevBtn);
        getPlanetsCard(result);
    }

    getPlanetsCard(result);

    function getPlanetsCard(result) {
        cardGroup.innerHTML = "";
        return result.results.map(function (p) {
            const planetCard = createCardsBlock("div", "card", cardGroup);
            //planetCard.classList.add("bg-dark");
            planetCard.innerHTML = `
                <div class="card-header">
                    <h4 class="card-title">${p.name}</h4>
                </div>
                <div class="card-body">
                    <p class="card-text">Climate: ${p.climate}</p>
                    <p class="card-text">Diameter: ${p.diameter}</p>
                    <p class="card-text">Population: ${p.population}</p>
                    <p class="card-text">Terrain: ${p.terrain}</p>
                    <p class="card-text">Orbital period: ${p.orbital_period}</p>
                    <button type="button" class="btnInfo btn btn-outline-light btn-sm" 
                    data-toggle="modal" data-target="#modalInfo">more info</button>
                </div>
            `

            const infoBtn = planetCard.querySelector(".btnInfo")
            infoBtn.addEventListener("click", function () {
                modalPlanet(p, planetCard)
            })
        })
    }

})

function cardCategory(category, property, modal) {
    if (category[property].length !== 0) {
        let list = modal.querySelector(`#${property}`)
        list.style.display = "block";
        category[property].map(v => fetch(urlFormat(v)).then(data => data.json())
            .then(function (res) {
                let nameProperty = document.createElement("p");
                nameProperty.textContent = `${res.name}`;
                nameProperty.classList.add("list-group-item");
                nameProperty.addEventListener("click", () => console.log(res));
                list.append(nameProperty);
            })
        )
    }
}

function dropdown(category, property, modal) {
    if (category[property].length !== 0) {
        let list = modal.querySelector(`#${property}`)
        list.innerHTML = `<button class="btn btn-secondary dropdown-toggle" 
                                type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                ${property}
                              </button>
                              <div class="dropdown-menu" aria-labelledby="dropdownMenuButton"></div>`
        let dropdownMenu = list.querySelector(".dropdown-menu");

        list.querySelector("button").addEventListener("click",function () {
            if(!dropdownMenu.children.length) category[property].map(v => fetch(urlFormat(v)).then(data => data.json())
                .then(function (res) {
                    let nameProperty = document.createElement("a");
                    nameProperty.textContent = `${res.name}`;
                    nameProperty.classList.add("dropdown-item");
                    nameProperty.addEventListener("click", () => console.log(res));
                    dropdownMenu.append(nameProperty);
                })
            )}
        )
    }
}

function pagination(result, nextList, nextBtn, prevBtn, root) {
    let length = Math.ceil(result.count / 10);
    for (let i = 1; i <= length; i++) {
        let list = document.createElement("li");
        list.classList.add("page-item", "number");
        list.innerHTML = `<button class="page-link bg-dark text-white">${i}</button>`
        list.querySelector("button").addEventListener("click", () => nextList(`${BaseURL}${root}?page=${i}`))
        let l = nextBtn.parentElement.previousSibling.textContent
        if (+l < length) nextBtn.parentNode.before(list);
    }
    nextBtn.addEventListener("click", () => nextList(urlFormat(result.next)))
    prevBtn.addEventListener("click", () => nextList(urlFormat(result.previous)))
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
             <div class="list-group" id="planet" style="display: none">Films:</div>
             <div class="list-group" id="residents" style="display: none">Residents:</div>
    `

    cardCategory(planet, "residents", modal);

    let list = modal.querySelector("#planet")
    if (planet.films.length !== 0) {
        list.style.display = "block"
        planet.films.map(function (film) {
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

    document.body.append(modal)
    let backdrop = document.createElement("div")
    backdrop.classList.add("modal-backdrop", "fade", "show")
    document.body.append(modal)
    document.body.append(backdrop)

    btnClose(modal, closeModal)

    document.addEventListener('keydown', event => {
        if (event.code === 'Escape') closeModal()
    });

    function closeModal() {
        modal.remove();
        backdrop.remove();
        document.body.classList.remove("modal-open")
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