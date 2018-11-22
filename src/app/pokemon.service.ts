import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

const IMAGE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

// URLS as constants
const POKEDEX_URL = 'https://pokeapi.co/api/v2/pokedex/1/';

const POKEAPI_URL = 'https://pokeapi.co/api/v2';

const POKEMON_BY_REGION_ID = [
  { id: 1, lower_limit: 1, upper_limit: 151 },
  { id: 2, lower_limit: 152, upper_limit: 251 },
  { id: 3, lower_limit: 252, upper_limit: 386 },
  { id: 4, lower_limit: 387, upper_limit: 393 },
  { id: 5, lower_limit: 394, upper_limit: 649 },
  { id: 6, lower_limit: 650, upper_limit: 721 },
  { id: 7, lower_limit: 722, upper_limit: 809 }
];

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private pokeDexDataUpdated = new Subject<any>();
  private genderDataUpdated = new Subject<any>();
  private habitatDataUpdated = new Subject<any>();
  private regionDataUpdated = new Subject<any>();

  constructor(private http: HttpClient) {}

  // fetch data from all the API's and clean data before processing
  getPokeDex() {
    return this.http
      .get<any>(POKEDEX_URL)
      .pipe(
        map(data => {
          let tempData = data.pokemon_entries;
          return (tempData = tempData.map(results => {
            results.id = results.entry_number;
            results.imageUrl = IMAGE_URL + results.id + '.png'; // Add image_url to the data
            results.show = false;
            return results;
          }));
        })
      )
      .subscribe(
        finalData => {
          // Load PokeDex API data before calling to remaining APIs
          this.pokeDexDataUpdated.next(finalData);
        },
        error => {
          console.log(error);
        }
      );
  }

  getPokeDexUpdateListener() {
    return this.pokeDexDataUpdated.asObservable();
  }
  getGenderDataListener() {
    return this.genderDataUpdated.asObservable();
  }
  getHabitatDataListener() {
    return this.habitatDataUpdated.asObservable();
  }
  getRegionDataListener() {
    return this.regionDataUpdated.asObservable();
  }
  // fetch gender data from the API with reference to the Pokedex DATA
  getGenderData(item: number) {
    this.http.get(`${POKEAPI_URL}/gender/${item}/`).subscribe(res => {
      this.genderDataUpdated.next(res);
    });
  }
  // fetch habitat data from the API with reference to the Pokedex DATA
  getHabitatData(item: number) {
    this.http.get(`${POKEAPI_URL}/pokemon-habitat/${item}/`).subscribe(res => {
      this.habitatDataUpdated.next(res);
    });
  }
  // fetch region data from the API with reference to the Pokedex DATA
  getRegionData(item: number) {
    this.http.get(`${POKEAPI_URL}/region/${item}/`).subscribe(res => {
      this.regionDataUpdated.next(res);
    });
  }
  searchByName(searchArray: any, searchName) {
    return searchArray.filter(pokemon => {
      const name = pokemon.pokemon_species.name.toLowerCase();
      return name.includes(searchName.toLowerCase()) ? pokemon : '';
    });
  }
  // Compare and filter data from Gender API with data from  pokeDexData and gender name/id
  searchByGender(searchArray: any, searchGender: string, genderData?) {
    // filter gender
    //let filtered_data = {};
    let matched_data;

    matched_data = genderData.find(x => x.name === searchGender);

    const matched_pokemon = [];

    return searchArray.filter(pokemon => {
      if (
        matched_data.pokemon_species_details.find(x => x.pokemon_species.name === pokemon.pokemon_species.name) ===
        undefined
      ) {
        return false;
      }
      return true;
    });
  }

  // Compare and filter data from Region API with data from  pokeDexData and region name/id
  searchByRegion(searchArray: any, searchRegion: string, regionData?) {
    let matched_region: any;

    matched_region = regionData.find(x => x.name === searchRegion);

    POKEMON_BY_REGION_ID.forEach((item, index, array) => {
      if (item.id === matched_region.id) {
        matched_region.upper_limit = item.upper_limit;
        matched_region.lower_limit = item.lower_limit;
      }
    });
    return searchArray.filter(pokemon => {
      if (pokemon.id <= matched_region.upper_limit && pokemon.id >= matched_region.lower_limit) {
        return true;
      }
      return false;
    });
  }

  // Compare and filter data from Habitat API with data from  pokeDexData and habitat name/id
  searchByHabitat(searchArray: any, searchHabitat: string, habitatData?) {
    // filter habitat
    const filtered_data = [];
    let matched_data: any;

    matched_data = habitatData.find(x => x.name === searchHabitat);

    return searchArray.filter(pokemon => {
      if (matched_data.pokemon_species.find(x => x.name === pokemon.pokemon_species.name) === undefined) {
        return false;
      }
      return true;
    });
  }
}
