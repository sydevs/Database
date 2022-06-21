/* exported OnlineMapLayer */
/* global m, AbstractMapLayer */

class OnlineMapLayer extends AbstractMapLayer {

  constructor(mapbox, config) {
    super(mapbox, Object.assign({
      id: 'online',
      style: 'mapbox://styles/sydevadmin/cl4nw934f001j14l8jnof3a7w',
      cluster: true,
    }, config))
  }

  showLocation(area) {
    m.route.set('/event/:id', { id: area.eventIds[0] })

    /*if (venue.eventIds.length > 1) {
      App.atlas.setCache('venues', venue)
      m.route.set('/venue/:id', { id: venue.id })
    } else {
      m.route.set('/event/:id', { id: venue.eventIds[0] })
    }*/
  }

}
