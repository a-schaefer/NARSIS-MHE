# NARSIS Multi-Hazard Explorer (NARSIS-MHE)
This software was created during the [NARSIS (New Approach to Reactor Safety ImprovementS)](https://cordis.europa.eu/project/id/755439/de) EU-Project from 2017 to 2021. It was part of WP1 on Multi-Hazard Modelling. This software can be described as a user interface to to compare and calculate multi-hazard scenarios. It focuses on the linear combination of independent hazards. Its framework is completely open source as well as the underlying data structure and published under the GNU GPLv3.0 license. 

You are welcome to continue the development.

## Installation
The NARSIS-MHE was solely build using the Electron framework and completely based on node.js and html. 
### Release Builds
From March 1st, 2021
- Windows
- Mac
- Linux

### Requirements
Requirements only apply when using the source code:
- bootstrap: 4.5.3
- csv-parser: 2.3.2
- electron: 6.0.0
- everpolate: 0.0.3
- jquery: 3.5.1
- leaflet: 1.5.1
- leaflet-map: 0.2.1
- logspace: 1.0.1
- plotly": 1.0.6
- plotly.js-dist: 1.49.1
- popper.js: 1.16.1

For release building use:
- electron-packager: 14.2.1

## Manual
### Program Structure
The calculation of multi-hazard combinations is split into 5 steps, each covering a different aspect for the multi-hazard assessment. Using the button "next step" the user is guided through each of them. 

### Site
The first step covers the site characteristics. A site is holds the basic information on the current assessment. Hazards are uniquely linked to a site. For better discrimination between different sites, the user can provide latitude and longitude. Sites can be removed and added. Each site needs its own independent hazard curves. 

### Hazard
The hazard section describes the collection of linearly independent hazards. Each hazard is described by a curve, one axis covering the return period, the other one the impact metric. A hazard can have multiple impact metrics but only one set of return periods. In addition, meta information can be provided to describe the impact metrics, its physical units and unique label. The label is necessary to uniquely identify hazards and to link them to site components below. Common labels are:
- EQ: Earthquake
- TO: Tornado
- FL: Flood
- LI: Lightning

Hazard curves can be imported using a csv file format. Meta information is still needed. Rate describes the return period of the hazard impact on the same row. 
Rate, Hazard-name1, Hazard-name2, ...
20,0.2,3,...
15,0.15,2,...
10,0.1,1,...
5,0.05,0.5,...

### Components
The components section describes various relevant site components. Each component is associated with an impact threshold upon which relevant damage or business interruption could be observed. Each component threshold uses the same hazard labels as above to link them together. The components are treated independent of site and hazards and delivered with their own file. This file "comps.json" can be found in the "/assets" folder and can also be modified in a text editor. A change of the underlying data structure is not recommended. 

### Logic
In the logic area, hazards and components are combined. Selecting a component allows to inspect the return periods at which a hazard is reach its impact thresholds. 
A linear hazard combination is based upon 2 assumptions:
- A primary hazard already occurred
- other hazards may take place in a specified time-window after the primary hazard occurrance. 

Both primary hazard and time window can be selected by the user. The software automatically recommends a primary hazard depending on which hazard will reach the component's impact threshold first.
Click on "Compute" to calculate the linear combination.

### Results
The results window summarizes the multi hazard combinations. Results can be inspected visually and data can be saved as a json file. Multihazard combinations are provided as log-10 steps in time. 