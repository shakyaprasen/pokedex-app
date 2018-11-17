import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

const IMAGE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

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
// ng-defer-load
@Component({
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.css']
})
export class PokemonListComponent {
  public isLoading = false;
  public searchName = '';
  public pokeDexData: any[] = [];
  private searchedPokemons = [];
  private allPokemons = [];
  private i = 0;

  constructor(private http: HttpClient, public dialog: MatDialog) {}

  fillPokeDex() {
    if (this.allPokemons.length > 1) {
      this.pokeDexData = [...this.allPokemons];
      return;
    }
    this.isLoading = true;
    return this.http
      .get<any>('https://pokeapi.co/api/v2/pokemon/?limit=20&offset=20')
      .subscribe(data => {
        let tempData = data.results;
        tempData = tempData.map(results => {
          const id = results.url.split('/');
          results.id = id[id.length - 2];
          results.imageUrl = IMAGE_URL + results.id + '.png';
          results.show = false;
          return results;
        });
        this.pokeDexData = [...tempData];
        this.allPokemons = [...tempData];
        this.isLoading = false;
      });
  }

  filterPokemon(e) {
    const filterString = e.target.value;
    this.searchedPokemons = [...this.pokeDexData];
    this.pokeDexData = this.allPokemons.filter(pokemon => {
      const name = pokemon.name;
      return name.includes(filterString) ? pokemon : '';
    });
  }

  clearFilter() {
    this.searchName = '';
    this.pokeDexData = [...this.allPokemons];
    this.searchedPokemons = [];
  }
  clearPokeDex() {
    this.pokeDexData = [];
  }

  showPokemonDetails(name: string) {
    const dialogRef = this.dialog.open(PokemonDetailDialogComponent, {
      width: '200 px',
      data: name
    });
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
