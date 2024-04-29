## Exam: KWS2100 Geographical Information Systems for the Web

For our final project in KWS2100, we've developed an application designed to
inform users about transportation delays. Additionally, users can measure
distances and estimate travel times for various modes of transport.
While waiting for their transportation, they can also explore information
about different European countries. Our thesis is that individuals interested
in public transportation and being one time may also have an interest in exploring different countries.

### Solution and highlight

#### Data Sources

We are using 5 different data sources to display features.

1. We are fetching buses from entur.no using their GraphQL websocket. The buses
   are being displayed as **points** on the map.

2. We are fetching trains from entur.no using their GraphQL websocket. Trains are being
   displayed as **points** on the map.

3. We are using GeoJSON to show european countries. The countries are shown
   as **polygons**.

4. We are using an endpoint from OSRM (Open Source Routing Machine) to fetch routes based
   on coordinates provided by click on the map. The route is shown on the map as **linestring**.

5. We are using GeoJSON to show Train Stations. Train stations are showed as **points**.

#### Overlay

You can click on a train station to display an overlay with train station information.

### Formal requirements:

1. Work in teams of 2 or 3:

- We have been working as a duo and programming has been done has pair programming.
