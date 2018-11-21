import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material';

import { PokemonService } from '../pokemon.service';
import { PokemonDetailDialogComponent } from '../pokemon-dialog/pokemon-dialog.component';
import { Subscription } from 'rxjs';

// 'female': 1, 'male': 2,'genderless': 3
const GENDER_DATA = [1, 2, 3];
// 'cave', 'forest','grassland','mountain','rare','rough-terrain','sea','urban','waters-edge'
const HABITAT_DATA = [1, 2, 3, 4, 5, 6, 7, 8, 9];
// 'gen-1-kanto','gen-2-johto','gen-3-hoenn','gen-4-sinnoh','gen-5-unova','gen-6-kalos','sun-moon-alola'
const REGION_DATA = [1, 2, 3, 4, 5, 6, 7];

@Component({
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.css']
})
export class PokemonListComponent implements OnInit, OnDestroy {
  public isLoading = true;
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
  private pokemonSubs: Subscription;
  private genderSubs: Subscription;
  private habitatSubs: Subscription;
  private regionSubs: Subscription;

  constructor(private http: HttpClient, public dialog: MatDialog, private pokemonService: PokemonService) {}

  ngOnInit() {
    this.fillPokeDex();
  }
  ngOnDestroy() {
    this.pokemonSubs.unsubscribe();
    this.genderSubs.unsubscribe();
    this.habitatSubs.unsubscribe();
    this.regionSubs.unsubscribe();
  }

  fillPokeDex() {
    if (this.allPokemons.length > 1) {
      this.pokeDexData = [...this.allPokemons];
      return;
    }
    this.pokemonService.getPokeDex();
    this.pokemonSubs = this.pokemonService.getPokeDexUpdateListener().subscribe(finalData => {
      this.asyncDataLoad(finalData).then();
      this.loadGenderData();
      this.loadHabitatData();
      this.loadRegionData();
      this.isLoading = false;
    });
  }

  loadGenderData() {
    const self = this;
    GENDER_DATA.forEach((item, index, arr) => {
      self.pokemonService.getGenderData(item);
    }, self);
    this.genderSubs = this.pokemonService.getGenderDataListener().subscribe(res => {
      const resArray = [res];
      this.genderData = this.genderData.concat(resArray);
    });
  }

  loadHabitatData() {
    const self = this;
    HABITAT_DATA.forEach((item, index, arr) => {
      self.pokemonService.getHabitatData(item);
    }, self);
    this.habitatSubs = this.pokemonService.getHabitatDataListener().subscribe(res => {
      const resArray = [res];
      this.habitatData = this.habitatData.concat(resArray);
    });
  }

  loadRegionData() {
    const self = this;
    REGION_DATA.forEach((item, index, arr) => {
      self.pokemonService.getRegionData(item);
    }, self);
    this.regionSubs = this.pokemonService.getRegionDataListener().subscribe(res => {
      const resArray = [res];
      this.regionData = this.regionData.concat(resArray);
    });
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
      this.currentSearchResults = this.pokemonService.searchByName(this.currentSearchResults, this.searchName);
    }
    if (this.searchGender !== '' && this.searchGender !== null && this.searchGender !== undefined) {
      this.currentSearchResults = this.pokemonService.searchByGender(
        this.currentSearchResults,
        this.searchGender,
        this.genderData
      );
    }
    if (this.searchRegion !== '' && this.searchRegion !== null && this.searchRegion !== undefined) {
      // filter by region
      this.currentSearchResults = this.pokemonService.searchByRegion(
        this.currentSearchResults,
        this.searchRegion,
        this.regionData
      );
    }
    if (
      // filter by habitat
      this.searchHabitat !== '' &&
      this.searchHabitat !== null &&
      this.searchHabitat !== undefined
    ) {
      this.currentSearchResults = this.pokemonService.searchByHabitat(
        this.currentSearchResults,
        this.searchHabitat,
        this.habitatData
      );
    }

    // load filtered data to the binded array
    this.pokeDexData = this.currentSearchResults;
    this.isLoading = false;
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
