/* globals DOMPurify axios */

const dotaApi = 'https://api.opendota.com/api'

const init = data => {
  const heroes = data.data.map(hero => {
    return {
      name: hero['localized_name'],
      primaryAttr: hero['primary_attr'].toLowerCase(),
      attackType: hero['attack_type'].toLowerCase(),
      roles: hero.roles.map(role => role.toLowerCase()),
      img: `https://api.opendota.com${hero.img}`,
      winPercent: ((hero['pro_win'] / hero['pro_pick']) * 100).toFixed(1) + '%'
    }
  })
  createRoles(heroes)
  renderHeroes(heroes)

  const filters = document.querySelector('.filters')
  filters.addEventListener('change', _ => {
    renderHeroes(filterHeroes(heroes))
  })
}

const createRoles = heroes => {
  // Create list of unique roles
  const rolesMap = heroes.map(hero => hero.roles)
    .reduce((acc, roles) => [...acc, ...roles], [])
    .sort()
  const roles = [...new Set(rolesMap)]

  // Populate Roles Filter
  const rolesDiv = document.querySelector('#role')
  rolesDiv.innerHTML = roles.map(role => `
    <div class="filter__option">
      <input type="checkbox" id="${role.toLowerCase()}" data-role="${role.toLowerCase()}">
      <label for="${role.toLowerCase()}">
        <svg viewbox="0 0 20 15">
          <use xlink:href="#checkmark"></use>
        </svg>
        <span>${role}</span>
      </label>
    </div>
  `)
    .join('')
}

const renderHeroes = heroes => {
  const innerHTML = heroes.map(hero => {
    return `<div class="hero">
      <img src="${hero.img}" />
      <div class="hero__name">${hero.name}</div>
      <div class="attack_type">${hero.winPercent}</div>
    </div>`
  }).join('')

  const heroesDiv = document.querySelector('.heroes')
  heroesDiv.innerHTML = DOMPurify.sanitize(innerHTML)
}

const filterHeroes = heroes => {
  const filter1 = filterByPrimaryAttribute(heroes)
  const filter2 = filterByAttackType(filter1)
  return filterByRoles(filter2)
}

const filterByPrimaryAttribute = heroes => {
  const selectedAttributes = Array.from(
    document.querySelector('#primary-attribute')
      .querySelectorAll(('input:checked'))
  ).map(el => el.id)

  if (!selectedAttributes.length) return heroes
  return heroes.filter(hero => {
    return selectedAttributes.includes(hero.primaryAttr)
  })
}

const filterByAttackType = heroes => {
  const selectedAttackTypes = Array.from(
    document.querySelector('#attack-type')
      .querySelectorAll(('input:checked'))
  ).map(el => el.id)

  if (!selectedAttackTypes.length) return heroes
  return heroes.filter(hero => {
    return selectedAttackTypes.includes(hero.attackType)
  })
}

const filterByRoles = heroes => {
  const selectedRoles = Array.from(
    document.querySelector('#role')
      .querySelectorAll(('input:checked'))
  ).map(el => el.id)

  return heroes.filter(hero => {
    return selectedRoles.every(selectedRole => {
      return hero.roles.includes(selectedRole)
    })
  })
}

axios.get(`${dotaApi}/heroStats`)
  // .then(data => console.log(data))
  .then(init)
  .catch(function (error) {
    // handle error
    console.log(error)
  })
