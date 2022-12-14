var allEvents = {}
const upcomingEvents = []
const pastEvents = []
const categories = []
var Input = {input: '', seted: false}
var actualEvents
var actualHref
var actualSrc

// Functions of the Search input --------------------------------------------------------------------------------------------------------
const searchInput = () => {
    let searchContainer = document.querySelector('.name_search_input')

    searchContainer.addEventListener('keyup', event => {
        Input.input = event.target.value
        event.target.value ? Input.seted = true : Input.seted = false
        filterCards()
    })
}

//Select all the checkboxs and wait for them to change to modified the boolean on the respective category -------------------------------
const checkboxListener = () => {
    let checkboxs = document.querySelectorAll('.category_search_checkbox')
    
    checkboxs.forEach(checkbox => {
        checkbox.addEventListener('change', event => {
            categories.map(category => {
                if (category.name == event.target.value) {
                    category.checked ? category.checked = false : category.checked = true
                }
            })
            filterCards()
        })
    })
}

//Select the specified event and save it in the details array ---------------------------------------------------------------------------
const linksListener = () => {
    let links = document.querySelectorAll('.card_button_link')
    
    links.forEach(link => {
        link.addEventListener('click', () => {
            allEvents.events.map(evento => {
                evento.name == link.id ? localStorage.setItem('myEvent', JSON.stringify(evento)) : null
            })
        })
    })
}

// Functions of the checkboxs ------------------------------------------------------------------------------------------------------------
// Render of the checkbox
const categoryCheckbox = (category) => {
    return `<div class="category_search_checkbox_container">
                <input class="category_search_checkbox" type="checkbox" name="category" id="${category.replace(' ','_')}" value="${category}">
                <label for="${category.replace(' ','_')}">${category}</label>
            </div>`
}

// Function to render all the checkboxs
const renderCategories = () => {
    let categoriesContainer = document.querySelector('.category_search')

    categories.map(category => {
        categoriesContainer.insertAdjacentHTML("beforeend", categoryCheckbox(category.name))
    })
    checkboxListener()
}

// Function of the cards -----------------------------------------------------------------------------------------------------------------
// Render of the card
const card = (event) => {
    return `<div class="card" id="${event.name.replace(" ","_")}">
                <img class="card-img-top card_img" src=${actualSrc} alt="Card image cap">
                <div class="card_body">
                    <div class="card_info">
                        <h5 class="card-title">${event.name}</h5>
                        <p class="card-text">${event.description}</p>
                    </div>
                    <div class="card_price_detail">
                        <p class="card_price">Price: $ ${event.price}</p>
                        <div class="card_button">
                            <a href=${actualHref} id="${event.name}" class="card_button_link">View Detail</a>
                        </div>
                    </div>
                </div>
            </div>`
}//${event.image}

// Function to render all the cards
const mapCards = () => {
    let cardContainer = document.querySelector('.cards_container')
    actualEvents.map(event => {
        cardContainer.insertAdjacentHTML("beforeend", card(event))
    })
    let eventNotFoundContainer = document.querySelector('.event_not_found_container')
    eventNotFoundContainer.insertAdjacentHTML("beforeend", noResultsRender())
}

// Function to render all the cards 
const filterCards = () => {
    let count = 0
    
    let checkInput = (event,id) => {
        let start = event.name.toLowerCase().startsWith(Input.input.toLowerCase())
        if (!Input.seted || start) {
            document.getElementById(id).classList.remove('hidden') 
        }
        else {
            document.getElementById(id).classList.add('hidden')
            count++
        }
    }
    
    let checked = categories.some(category => category.checked == true)
    
    actualEvents.map(event => {
        let id = event.name.replace(" ","_")
        if (!checked){
            return checkInput(event,id)
        }
        categories.map(category => {
            if (category.name == event.category) {
                if (category.checked) {
                    checkInput(event,id)
                }
                else {
                    document.getElementById(id).classList.add('hidden')
                    count++
                }
            }
        })
    })

    let notFound = document.querySelector('.not_found_container')
    count == actualEvents.length ? notFound.classList.remove('hidden') : notFound.classList.add('hidden')
}

// Function to render the not found events
const noResultsRender = () => {
    return `<div class="animate__animated animate__zoomIn not_found_container hidden">
                <img src="https://i.giphy.com/media/26AHs3p7U7H5MU2gU/200w.gif" alt="">
                <div class="not_found_info_container">
                    <p class="not_found">Event not found</p>
                    <p class="not_found_description">Please try other search!</p>
                </div>
            </div>`
}

// Details functions -------------------------------------------------------------------------------------
// Get the event details from the localStorage 
const viewDetail = async () => {
    let event = JSON.parse(localStorage.getItem('myEvent'))
    localStorage.clear()
    let detailContainer = document.getElementById('card_details')
    detailContainer.insertAdjacentHTML("beforeend", detailCard(event))
}

// Render of the details card
const detailCard = (event) => {
    return `<img class="card_image" src="${event.image}" alt="${event.name}">
            <div class="detail_description">
                <h5 class="card-title card_title">${event.name}</h5>
                <p class="card-text">${event.description}</p>
            </div>`
}

// Stats Functions -----------------------------------------------------------------------------------------
// Function to render all the statistics of the table
const setStats = () => {
    const eventsStatistics = document.querySelector('#events_statistics')
    const upcomingEventsStatistics = document.querySelector('#upcoming_events_statistics')
    const pastEventsStatistics = document.querySelector('#past_events_statistics')
    let eventsAttendance = []

    allEvents.events.map(event => {
        let assistance = event.assistance || event.estimate
        eventsAttendance.push({
            name: event.name,
            capacity: event.capacity,
            assistance,
            porcentage: Math.round((assistance / event.capacity) * 100)
        })
    })

    let eventsToShow = Math.round(eventsAttendance.length / 10)
    
    let capacitySort = eventsSort(eventsAttendance,'capacity')
    let largeCapacity = capacitySort.slice(0,eventsToShow)
    let porcentageSort = eventsSort(eventsAttendance,'porcentage')
    let highestPorcentage = porcentageSort.slice(0,eventsToShow)
    let lowestPorcentage = porcentageSort.reverse().slice(0,eventsToShow)

    for (let i = 0; i < eventsToShow; i++) {
        eventsStatistics.insertAdjacentHTML('beforeend',
        tableRow([
            `${highestPorcentage[i].name} (${highestPorcentage[i].porcentage}%)`,
            `${lowestPorcentage[i].name} (${lowestPorcentage[i].porcentage}%)`,
            `${largeCapacity[i].name} (${largeCapacity[i].capacity})`
        ]))
    }

    let allCategories = []

    allEvents.events.map(event => {
        let finded = allCategories.find(category => category == event.category)
        !finded ? allCategories.push(event.category) : null
    })
    
    categoryStats(allCategories,upcomingEventsStatistics,upcomingEvents)
    categoryStats(allCategories,pastEventsStatistics,pastEvents)
}

// Function to render the sub-events stats
const categoryStats = (allCategories,eventsContainer,events) => {
    allCategories.map(category => {
        let eventsPerCategory = []
        let eventRevenues = 0
        let eventAssistance = 0
        let eventCapacity = 0

        events.map(event => {
            if (category == event.category) eventsPerCategory.push(event)
        })

        eventsPerCategory.map(event => {
            let assistance = Number(event.assistance) || Number(event.estimate)
            eventRevenues += event.price * assistance
            eventAssistance += assistance
            eventCapacity += Number(event.capacity)
        })

        let porcentage = ((eventAssistance/eventCapacity) * 100)
        porcentage ? porcentage = porcentage.toFixed(2) : porcentage = 0

        eventsContainer.insertAdjacentHTML('beforeend', tableRow([category,`$ ${eventRevenues}`,`${porcentage} %`]))
    })
}

// Function to order the events by capacity or porcentage
const eventsSort = (events,key) => {

    events.sort((a,b) => {
        return b[key] - a[key]
    })
    return events
}

// Function to render the row of the table
const tableRow = (content) => {
    return `<tr>
                <td>${content[0]}</td>
                <td>${content[1]}</td>
                <td>${content[2]}</td>
            </tr>`
}

// Function to start the render of the pages ----------------------------------------------------------------
// Function to get the events and categories
const getEvents = async (url) => {
    let response = await fetch(url)
    let dataEvents = await response.json()

    // Iterate the events and separate them into categories (pastEvents and upcomingEvents)
    // and add the categories of the events to the categories array if they are not already, with a boolean value
    dataEvents.events.map(event => {
        Date.parse(event.date) < Date.parse(dataEvents.currentDate) ? pastEvents.push(event) : upcomingEvents.push(event)
        categories.find(category => category.name == event.category) ? null : categories.push({name: event.category, checked: false})
    })
    return dataEvents
}

// Function to render the checkboxs, the cards and to add the events listeners
const mainRender = async (reRender,events,href,src) => {
    reRender ? null : renderCategories()
    actualEvents = events
    actualHref = href
    actualSrc = src
    mapCards()
    searchInput()
    linksListener()
    getEvents()
}

// Function to render the pages
const renderPage = async (reRender) => {
    let URLactual = window.location.pathname.split('/').pop()
    
    switch (URLactual) {
        case '': allEvents = await getEvents('./events.json'); mainRender(reRender,allEvents.events,'./pages/details.html','./images/200w.gif'); break;
        case 'index.html': allEvents = await getEvents('./events.json'); mainRender(reRender,allEvents.events,'./pages/details.html','./images/200w.gif'); break;
        case 'upcomingEvents.html': allEvents = await getEvents('../events.json'); mainRender(reRender,upcomingEvents,'../pages/details.html','../images/200w.gif'); break;
        case 'pastEvents.html': allEvents = await getEvents('../events.json'); mainRender(reRender,pastEvents,'../pages/details.html','../images/200w.gif'); break;
        case 'details.html': await viewDetail();break;
        case 'stats.html': allEvents = await getEvents('../events.json'); setStats(); break;
    }
}

// Invoke the render function when the page is loaded
window.onload = renderPage(false)