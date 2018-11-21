 Application Folder

This folder contains all the typescript file which can be edited to suit your needs.

This document describes in brief the basic functions of each component/module.


 Error

An error component which intercepts each http request and checks the response to see if it has any errors in its status code/response message and shows it in a dialog box.

 Pokemon List

This is the main component which renders the Pokedex/pokemon list view and makes all the calls to Pokemon Service to render the Pokedex.

Pokemon Service - A helper service which complements Pokemon List component in making various http calls as well as carrying out search queries.

	Pokemon Dialog

This component helps in rendering the pokemon details view in a dialog box with the help of Pokemon Dialog Srvice.

Pokemon Dialog Service - A helper service to Pokemon Dialog component which makes http calls to `https://pokeapi.co/api/v2/pokemon/(selected-pokemon-id)` to fetch the pokemon details from PokeApi's RESTful API.