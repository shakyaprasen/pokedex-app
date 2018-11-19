import { Component, Inject, OnInit, AfterViewChecked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { map } from 'rxjs/operators';

// Data Model for use in the Dialog Box
export interface DialogPokemonData {
  abilities: [];
  base_experience: number;
  height: number;
  id: number;
  moves: [];
  stats: [];
  types: [];
  weight: number;
}
const IMAGE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

// URLS as constants
const POKEDEX_URL = 'https://pokeapi.co/api/v2/pokedex/1/';

const POKEAPI_URL = 'https://pokeapi.co/api/v2';

// 'female': 1, 'male': 2,'unknown': 3
const GENDER_DATA = [1, 2, 3];
// 'cave', 'forest','grassland','mountain','rare','rough-terrain','sea','urban','waters-edge'
const HABITAT_DATA = [1, 2, 3, 4, 5, 6, 7, 8, 9];
// 'gen-1-kanto','gen-2-johto','gen-3-hoenn','gen-4-sinnoh','gen-5-unova','gen-6-kalos','sun-moon-alola'
const REGION_DATA = [1, 2, 3, 4, 5, 6, 7];

const POKEMON_BY_REGION_ID = [
  { id: 1, lower_limit: 1, upper_limit: 151 },
  { id: 2, lower_limit: 152, upper_limit: 251 },
  { id: 3, lower_limit: 252, upper_limit: 386 },
  { id: 4, lower_limit: 387, upper_limit: 393 },
  { id: 5, lower_limit: 394, upper_limit: 649 },
  { id: 6, lower_limit: 650, upper_limit: 721 },
  { id: 7, lower_limit: 722, upper_limit: 809 }
];

@Component({
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.css']
})
export class PokemonListComponent implements OnInit {
  public isLoading = false;
  public searchName = '';
  public searchHabitat = '';
  public searchGender = '';
  public searchRegion = '';
  public currentSearchResults = [];

  public pokeDexData: any[] = [];
  private allPokemons = [];
  private i = 0;
  public genderData = [];
  public habitatData = [];
  public regionData = [];

  ngOnInit() {
    this.fillPokeDex();
  }
  constructor(private http: HttpClient, public dialog: MatDialog) {}

  // fetch data from all the API's and clean data before processing
  fillPokeDex() {
    if (this.allPokemons.length > 1) {
      this.pokeDexData = [...this.allPokemons];
      return;
    }
    this.isLoading = true;
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
      .subscribe(finalData => {
        // Load PokeDex API data before calling to remaining APIs
        this.asyncDataLoad(finalData).then();
        this.getGenderData();
        this.getHabitatData();
        this.getRegionData();
        this.isLoading = false;
      },
      error => {
        console.log(error);
      });
  }

  // fetch gender data from the API with reference to the Pokedex DATA
  getGenderData() {
    const self = this;
    GENDER_DATA.forEach((item, index, arr) => {
      self.http.get(`${POKEAPI_URL}/gender/${item}/`).subscribe(res => {
        const resArray = [res];
        self.genderData = self.genderData.concat(resArray);
      });
    }, self);
  }
  // fetch habitat data from the API with reference to the Pokedex DATA
  getHabitatData() {
    const self = this;
    HABITAT_DATA.forEach((item, index, arr) => {
      self.http
        .get(`${POKEAPI_URL}/pokemon-habitat/${item}/`)
        .subscribe(res => {
          const resArray = [res];
          self.habitatData = self.habitatData.concat(resArray);
        });
    }, self);
  }
  // fetch region data from the API with reference to the Pokedex DATA
  getRegionData() {
    const self = this;
    REGION_DATA.forEach((item, index, arr) => {
      self.http.get(`${POKEAPI_URL}/region/${item}/`).subscribe(res => {
        const resArray = [res];
        self.regionData = self.regionData.concat(resArray);
      });
    }, self);
  }
  // Insert the data to the binded array (pokeDexData) in async mode
  asyncDataLoad(tempData: any) {
    return new Promise((resolve, reject) => {     
	  this.pokeDexData = [...tempData];
  	  this.allPokemons = [...tempData];
      this.currentSearchResults = [...tempData];
      resolve();
    });
  }

  // Clear the current pokeDexData
  clearPokeDex() {
    this.pokeDexData = [];
    this.currentSearchResults = [];
  }

  // call search function
  search() {
    this.isLoading = true;
    this.filterPokemon();
    this.isLoading = false;
  }
  // update name search parameter with key up
  updateNameParameter(e) {
    const filterString = e.target.value;
    this.searchName = filterString;
    if (e.code === 'Enter') {
      this.search();
    }
    return;
  }
  // update the gender parameter from gender select menu
  updateGenderParameter(gender) {
    this.searchGender = gender;
    return;
  }
  // update the region parameter from gender select menu
  updateRegionParameter(region) {
    this.searchRegion = region;
    return;
  }
  // update the habitat parameter from gender select menu
  updateHabitatParameter(habitat) {
    this.searchHabitat = habitat;
    return;
  }

  // Filter function where the current search params are taken and the pokeDexData is filtered
  filterPokemon() {
    this.currentSearchResults = [...this.allPokemons];
    if (this.currentSearchResults.length < 1) {
      return;
    }
    if (
      // filter by name
      this.searchName !== '' &&
      this.searchName !== null &&
      this.searchName !== undefined
    ) {
      this.currentSearchResults = this.currentSearchResults.filter(pokemon => {
        const name = pokemon.pokemon_species.name;
        return name.includes(this.searchName) ? pokemon : '';
      });
    }
    if (
      this.searchGender !== '' &&
      this.searchGender !== null &&
      this.searchGender !== undefined
    ) {
      // filter by gender
      this.searchPokemonByGender();
    }
    if (
      this.searchRegion !== '' &&
      this.searchRegion !== null &&
      this.searchRegion !== undefined
    ) {
      // filter by region
      this.searchPokemonByRegion();
    }
    if (
      // filter by habitat
      this.searchHabitat !== '' &&
      this.searchHabitat !== null &&
      this.searchHabitat !== undefined
    ) {
      this.searchPokemonByHabitat();
    }
    // load filtered data to the binded array
    this.pokeDexData = this.currentSearchResults;
    this.isLoading = false;
  }

  // Compare and filter data from Region API with data from  pokeDexData and region name/id
  searchPokemonByRegion() {
    let matched_region: any;
    this.regionData.forEach((item, index, arr) => {
      if (item.name === this.searchRegion) {
        matched_region = item;
      }
    });
    POKEMON_BY_REGION_ID.forEach((item, index, array) => {
      if (item.id === matched_region.id) {
        matched_region.upper_limit = item.upper_limit;
        matched_region.lower_limit = item.lower_limit;
      }
    });
    this.currentSearchResults = this.currentSearchResults.filter(pokemon => {
      if (
        pokemon.id <= matched_region.upper_limit &&
        pokemon.id >= matched_region.lower_limit
      ) {
        return true;
      }
      return false;
    });
    return;
  }
  // Compare and filter data from Gender API with data from  pokeDexData and gender name/id
  searchPokemonByGender() {
    // filter gender
    let filtered_data = {};
    let matched_data = [];

    this.genderData.forEach((item, index, arr) => {
      if (item.name === this.searchGender) {
        matched_data = item.pokemon_species_details;
      }
    }, this);
    const matched_pokemon = [];

    matched_data.forEach((item, index, arr) => {
      matched_pokemon.push(item.pokemon_species);
    }, this);
    this.currentSearchResults = this.currentSearchResults.filter(pokemon => {
      let i = 0;
      let flag = false;

      for (const item of matched_pokemon) {
        if (item.name === pokemon.pokemon_species.name) {
          matched_pokemon.splice(i, 1);
          filtered_data = item;
          flag = true;
          break;
        }
        i++;
      }
      return flag;
    });
    return;
  }
  // Compare and filter data from Habitat API with data from  pokeDexData and habitat name/id
  searchPokemonByHabitat() {
    // filter habitat
    let filtered_data = {};
    let matched_data: any;

    this.habitatData.forEach((item, index, arr) => {
      if (item.name === this.searchHabitat) {
        matched_data = item.pokemon_species;
      }
    }, this);
    const temp_data = [...matched_data];
    this.currentSearchResults = this.currentSearchResults.filter(pokemon => {
      let i = 0;
      let flag = false;

      for (const item of temp_data) {
        if (item.name === pokemon.pokemon_species.name) {
          temp_data.splice(i, 1);
          filtered_data = item;
          flag = true;
          break;
        }
        i++;
      }
      return flag;
    });
    return;
  }
  // Open a new dialog box showing Pokemon Details
  showPokemonDetails(id: number) {
    const dialogRef = this.dialog.open(PokemonDetailDialogComponent, {
      width: '600px',
      panelClass: 'dialog-box',
      data: id
    });
  }
}

// Pokemon details dialog box component
@Component({
  templateUrl: '../pokemon-detail.component.html',
  styleUrls: ['../pokemon-detail.component.css']
})
export class PokemonDetailDialogComponent implements OnInit {
  pokeData = [];
  isDialogLoading = true;

  constructor(
    private http: HttpClient,
    public dialogRef: MatDialogRef<PokemonDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogPokemonData
  ) {}

  ngOnInit() {
    // call to pokemon details url on initialization
    return this.http
      .get<any>(`${POKEAPI_URL}/pokemon/${this.data}/`)
      .subscribe(pokeData => {
        this.pokeData = pokeData;
        this.isDialogLoading = false;
      });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
