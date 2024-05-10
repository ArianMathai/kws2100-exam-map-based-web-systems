# Exam: KWS2100 Geographical Information Systems for the Web

Webiste: https://kristiania-kws2100-2024.github.io/kws2100-exam-ArianMathai/

## Description

For our final project in KWS2100, we've developed an application aimed at informing users about transportation delays.
Additionally, users can measure distances and estimate travel times for various modes of transport, obtain an overview
of trains in the southern part of Norway, and explore facts about different European countries while waiting for their
transportation.

## Solution and Highlight

### Data Sources

We utilize 5 different data sources to display features:

1. **Buses**: We fetch bus data from entur.no using their GraphQL websocket. Buses are displayed as points on the map.

2. **Trains**: Train data is fetched from entur.no using their GraphQL websocket and displayed as points on the map.

3. **European Countries**: We use GeoJSON to display European countries as polygons.

4. **Routes**: OSRM endpoint is utilized to fetch routes based on coordinates provided by
   clicking on the map. The route is displayed on the map as a linestring.

5. **Train Stations**: GeoJSON is used to display train stations as points.

### Overlay

Clicking on a train station displays an overlay with train station information.
Overlays are also used for European countries, which can be hovered over.

### Overview Map

An Overview map is added when the map is created within the context.

### Displaying Moving Data

Live data for buses and trains is shown, obtained from entur GraphQL websocket.
Selecting a bus company sets up a new websocket using the bus company ticket.
Trains are fetched on application load and can be viewed by checking "view trains and train-stations".
Transportation status is indicated by color: "Red" for delayed and "green" for on time.

### Display Cluster Vector

Clusters are used to gather stations when zooming out. Each cluster indicates the number of stations gathered.
Stations switch to being styled with an icon when zoomed in.

### Draw Polygon on Map to Display Bus Information

When buses are activated, a polygon can be drawn to mark buses and determine if they are delayed or not.

### Session Storage

Both train and bus data are stored in session storage to persist during reloads. Trains leave a trail behind them. Session storage is used to start with a clean slate if the tab is closed.

## Formal Requirements

1. Work in Teams of 2 or 3:

   - For the most part, being a duo, we have been doing pair programming.
