import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { map } from 'rxjs/operators';

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

  fillPokeDex() {
    if (this.allPokemons.length > 1) {
      this.pokeDexData = [...this.allPokemons];
      return;
    }
    this.isLoading = true;
    return this.http
      .get<any>('https://pokeapi.co/api/v2/pokedex/1/')
      .pipe(
        map(data => {
          let tempData = data.pokemon_entries;
          return (tempData = tempData.map(results => {
            results.id = results.entry_number; // this.getPokemonId(results.url);
            results.imageUrl = IMAGE_URL + results.id + '.png';
            results.show = false;
            return results;
          }));
        })
      )
      .subscribe(finalData => {
        this.asyncDataLoad(finalData).then(
          res => {
            this.getGenderData();
            this.getHabitatData();
            this.getRegionData();
            this.isLoading = false;
          },
          error => {
            console.log(error);
          }
        );
        this.isLoading = false;
      });
  }

  // getPokemonId(url) {
  //   const id = url.split('/');
  //   return id[id.length - 2];
  // }
  getGenderData() {
    const self = this;
    GENDER_DATA.forEach((item, index, arr) => {
      self.http
        .get(`https://pokeapi.co/api/v2/gender/${item}/`)
        .subscribe(res => {
          const resArray = [res];
          self.genderData = self.genderData.concat(resArray);
        });
    }, self);
  }

  getHabitatData() {
    const self = this;
    HABITAT_DATA.forEach((item, index, arr) => {
      self.http
        .get(`https://pokeapi.co/api/v2/pokemon-habitat/${item}/`)
        .subscribe(res => {
          const resArray = [res];
          self.habitatData = self.habitatData.concat(resArray);
        });
    }, self);
  }

  getRegionData() {
    const self = this;
    REGION_DATA.forEach((item, index, arr) => {
      self.http
        .get(`https://pokeapi.co/api/v2/region/${item}/`)
        .subscribe(res => {
          const resArray = [res];
          self.regionData = self.regionData.concat(resArray);
        });
    }, self);
  }

  asyncDataLoad(tempData: any) {
    return Promise.resolve().then(v => {
      this.pokeDexData = [...tempData];
      this.allPokemons = [...tempData];
      this.currentSearchResults = [...tempData];
    });
  }

  clearFilter() {
    this.searchName = '';
    this.pokeDexData = [...this.allPokemons];
    this.currentSearchResults = [...this.allPokemons];
  }
  clearPokeDex() {
    this.pokeDexData = [];
    this.currentSearchResults = [];
  }

  showPokemonDetails(name: string) {
    const dialogRef = this.dialog.open(PokemonDetailDialogComponent, {
      width: '200 px',
      data: name
    });
  }

  search() {
    this.isLoading = true;
    this.filterPokemon();
    this.isLoading = false;
  }
  filterByName(e) {
    const filterString = e.target.value;
    this.searchName = filterString;
  }
  filterByGender(gender) {
    this.searchGender = gender;
  }

  filterByRegion(region) {
    this.searchRegion = region;
  }

  filterByHabitat(habitat) {
    this.searchHabitat = habitat;
  }

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
      this.searchPokemonByGender();
    }
    if (
      this.searchRegion !== '' &&
      this.searchRegion !== null &&
      this.searchRegion !== undefined
    ) {
      this.searchPokemonByRegion();
    }
    if (
      this.searchHabitat !== '' &&
      this.searchHabitat !== null &&
      this.searchHabitat !== undefined
    ) {
      this.searchPokemonByHabitat();
    }

    this.pokeDexData = this.currentSearchResults;
    this.isLoading = false;
  }

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
          console.log(item);
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
}

@Component({
  templateUrl: '../pokemon-detail.component.html',
  styleUrls: ['../pokemon-detail.component.css']
})
export class PokemonDetailDialogComponent implements OnInit {
  pokeData = [];

  constructor(
    private http: HttpClient,
    public dialogRef: MatDialogRef<PokemonDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogPokemonData
  ) {}

  ngOnInit() {
    return this.http
      .get<any>(`https://pokeapi.co/api/v2/pokemon/${this.data}/`)
      .subscribe(pokeData => {
        this.pokeData = pokeData;
      });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
