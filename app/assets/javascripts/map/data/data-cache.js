
class DataCache {
  
  #cache
  #atlas

  constructor() {
    this.#atlas = new AtlasAPI()
    this.#cache = {
      events: {},
      venues: {},
      geojsons: {},
      lists: {},
      closestVenue: null,
      closestfetchVenue: null,
    }
  }

  searchEvents(params) {
    console.log('[Data]', 'searching events', params) // eslint-disable-line no-console
    return this.#atlas.searchEvents(params).then(data => data.events)
  }

  getGeojson(layer) {
    if (layer in this.#cache.geojsons) {
      return Promise.resolve(this.#cache.geojsons[layer])
    } else {
      console.log('[Data]', 'getting geojson', layer) // eslint-disable-line no-console
      return this.#atlas.fetchGeojson({
        online: layer == 'online',
        languageCode: (layer == 'online' ? window.locale : null),
      }).then(data => {
        this.#cache.geojsons[layer] = data.geojson
        return data.geojson
      })
    }
  }

  getVenue(id) {
    if (id in this.#cache.venues) {
      return Promise.resolve(this.#cache.venues[id])
    } else {
      console.log('[Data]', 'getting venue', id) // eslint-disable-line no-console
      return this.#atlas.fetchVenue({ id: id }).then(data => {
        const venue = new Venue(data.venue)
        this.#cache.venues[id] = venue
        return venue
      })
    }
  }

  getEvent(id) {
    if (id in this.#cache.events) {
      return Promise.resolve(this.#cache.events[id])
    } else {
      console.log('[Data]', 'getting event', id) // eslint-disable-line no-console
      return this.#atlas.fetchEvent({ id: id }).then(data => {
        const event = new AtlasEvent(data.event)
        this.#cache.events[id] = event
        return event
      })
    }
  }

  async getEvents(ids) {
    let uncachedEventIds = ids.filter(id => !(id in this.#cache.events))

    if (uncachedEventIds.length > 0) {
      console.log('[Data]', 'getting events', ids, '(' + (1 - uncachedEventIds.length / ids.length) * 100 + '% cached)') // eslint-disable-line no-console
      const data = await this.#atlas.fetchEvents({ ids: uncachedEventIds })
      data.events.forEach(event => {
        this.#cache.events[event.id] = new AtlasEvent(event)
      })
    }

    return ids.map(id => this.#cache.events[id]).filter(Boolean)
  }

  getList(layer, ids = null) {
    let fetchList

    if (this.#cache.lists[layer]) {
      return Promise.resolve(this.#cache.lists[layer])
    } else if (layer == 'online') {
      console.log('[Data]', 'getting list', layer) // eslint-disable-line no-console
      fetchList = this.#atlas.fetchOnlineList().then(response => {
        return response.events.map(event => {
          event = new AtlasEvent(event)
          this.#cache.events[event.id] = event
          return event
        })
      })
    } else {
      console.log('[Data]', 'getting list', layer) // eslint-disable-line no-console
      fetchList = this.getEvents(ids)
    }

    return fetchList.then(list => {
      list.sort((a, b) => a.priority - b.priority)
      this.#cache.lists[layer] = list
      return list
    })
  }

  getClosestVenue(params) {
    let cache = this.#cache.closestVenue
    let cacheQuery = this.#cache.closestfetchVenue
    if (cache && cacheQuery) {
      const distance = Util.distance(params, cacheQuery)
      if (distance <= 0.5) {
        return Promise.resolve(cache)
      }
    }
    
    console.log('[Data]', 'getting closest venue', params) // eslint-disable-line no-console
    return this.#atlas.fetchClosestVenue(params).then(data => {
      this.#cache.closestfetchVenue = params
      this.#cache.closestVenue = data.closestVenue
      return data.closestVenue
    })
  }

  // MUTATION REQUESTS

  createRegistration(params) {
    console.log('[Data]', 'creating registration', params) // eslint-disable-line no-console
    params.locale = window.locale
    return this.sendRegistration({
      'input!CreateRegistrationInput': params
    })
  }

  // HELPER METHODS

  getRecord(model, id) {
    if (model == 'venue') {
      return this.getVenue(id)
    } else if (model == 'event') {
      return this.getEvent(id)
    } else {
      return Promise.resolve(null)
    }
  }

  setCache(key, object) {
    this.#cache[key][object.id] = object
  }

  clearCache(key) {
    this.#cache[key] = {}
  }

}