export default {
  buildFlightPendingNotification: (fromName, fromIata, toName, toIata, flightNumber) =>
    `### READY FOR TAKEOFF - NOTIFICATION ###
-----------------------------------------
Jestem już na lotnisku, gotowy do mojego lotu z *${fromName} (${fromIata})* do ${toName} (${toIata}) lotem numer ${flightNumber}.

Dam znać zaraz po wylądowaniu. Lot można śledzić na Flight Radarze pod adresem: https://www.flightradar24.com/${flightNumber} (link działa po wystartowaniu samolotu)`,

  buildDelayedFlightNotification: (toName, toIata) =>
`### DELAYED FLIGHT - NOTIFICATION ###
-----------------------------------------
Niestety wygląda na to, że mój lot do ${toName} (${toIata}) jest opóźniony. Będę informował o dalszych etapach podróży.`,

  buildArrivalNotification: (toName, toIata) =>
`### ON ARRIVAL - NOTIFICATION ###
-----------------------------------------
Wylądowałem właśnie na lotnisku w ${toName} (${toIata}) :)`
}
