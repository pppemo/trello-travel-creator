export default {
  buildFlightPlanNotification: flightSegments => {
    const firstAirport = flightSegments[0].fromName
    const consequtiveAirports = flightSegments.map(airport => airport.toName)
    const airports = [firstAirport].concat(consequtiveAirports).join('  ➡️ ')
    return `Dzisiaj będę leciał tak: ${airports}.\n\n`
  },
  buildFlightPendingNotification: (fromName, fromIata, toName, toIata, flightNumber, airlineName,
    departure, arrival, flightRadarShortenedURL, destinationOutsideEU) =>
    `Jestem na lotnisku, gotowy do mojego lotu z ${fromName} (${fromIata}) do *${toName} (${toIata})* lotem numer ${flightNumber} linii ${airlineName}.\n\n` +
    `Planowy wylot z ${fromName} o ${departure}, a przylot do ${toName} o ${arrival}.\n\n` +
    'Dam znać zaraz po wylądowaniu. ' +
    (destinationOutsideEU ? `Jednakże lotnisko w ${toName} nie jest w Unii Europejskiej, więc nie dam znać od razu, bo będę musiał najpierw znaleźć Wi-Fi na lotnisku, żebym mógł wysłać wiadomość. ` : '') +
    `Lot można śledzić na Flight Radarze pod adresem: ${flightRadarShortenedURL} (link działa po wystartowaniu samolotu)`,

  buildDelayedFlightNotification: (toName, toIata) =>
    `Niestety wygląda na to, że mój lot do ${toName} (${toIata}) jest opóźniony. Będę informował o dalszych etapach podróży.`,

  buildArrivalNotification: (toName, toIata, hasFollowingSegment, followingFlightSegment) =>
    `Wylądowałem właśnie na lotnisku w ${toName} (${toIata}) :)` +
    (hasFollowingSegment ? `\n\nKolejny lot do ${followingFlightSegment.toName} mam o ${followingFlightSegment.departure}.` : '')
}
