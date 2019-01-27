import * as moment from 'moment'

export default {
  buildFlightPlanNotification: flightSegments => {
    const flights = flightSegments.map(flightSegment => `\n✈️  Lot ${flightSegment.fromName} - ${flightSegment.toName}`).join('\n')
    return `Dzieeeeeeń dooobry!!! 😁\nOto plan mojej dzisiejszej podróży: ${flights}\n\n`
  },
  buildFlightPendingNotification: (fromName, fromIata, toName, toIata, flightNumber, airlineName,
    departureTimestamp, arrivalTimestamp, flightRadarShortenedURL, destinationOutsideEU) =>
    `Mój najbliższy lot *${fromName} (${fromIata}) ➡️  ${toName} (${toIata})* ma numer ${flightNumber} i odbędzie się samolotem linii ${airlineName}.\n\n` +
    `Start zaplanowany jest na ${moment(departureTimestamp).format('HH:mm')}, a na miejscu powinienem być o ${moment(arrivalTimestamp).format('HH:mm')}. Teraz jestem już na lotnisku i przygotowuję się do lotu.\n\n` +
    'Tradycyjnie dam znać zaraz po wylądowaniu! ' +
    (destinationOutsideEU ? `Natomiast lotnisko ${toIata} (${toName}) nie znajduje się na terytorium Unii Europejskiej, więc nie ma tam bezpłatnego internetu, więc nie dam znać od razu, bo będę musiał najpierw znaleźć Wi-Fi na lotnisku, żebym mógł wysłać wiadomość. ` : '') +
    `\n\nLot jak zwykle możesz też śledzić na Flight Radarze pod adresem: ${flightRadarShortenedURL} (śledzenie działa po wystartowaniu samolotu). Wszystkie godziny podałem w czasie polskim.`,

  buildDelayedFlightNotification: (fromName, toName) =>
    `Niestety wygląda na to, że mój lot ${fromName} - ${toName} jest opóźniony. Będę informował o dalszych etapach podróży.`,

  buildArrivalNotification: (toName, toIata, hasFollowingSegment, followingFlightSegment) =>
    `${toName}!!! 🛬 Wylądowałem właśnie na lotnisku ${toIata} 😊` +
    (hasFollowingSegment ? `\n\nKolejny lot do ${followingFlightSegment.toName} mam o ${moment(followingFlightSegment.departureTimestamp).format('HH:mm')}.` : '')
}
