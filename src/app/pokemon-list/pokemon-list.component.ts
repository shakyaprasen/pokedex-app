import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { map } from 'rxjs/operators';

const IMAGE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";

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

  public pokeDexData = [];
  private searchedPokemons = [];
  private allPokemons = [];
  private i = 0;

  constructor(
    private http: HttpClient,
    public dialog: MatDialog,
  ) {}

  fillPokeDex() {
    return this.http
      .get<any>('https://pokeapi.co/api/v2/pokemon/?limit=20&offset=20')
      .subscribe( data => {
        let tempData = data.results.slice(0,20);
        tempData = tempData.map(data => {
          const id = data.url.split('/');
          data.id = id[id.length-2];
          data.imageUrl = IMAGE_URL + data.id + ".png"
          return  data
        })
        this.pokeDexData = [...tempData];
        this.allPokemons = [...tempData];
      }
      );
  }

  filterPokemon(e) {
    const filterString = e.target.value;
    this.searchedPokemons = [...this.pokeDexData];
    this.pokeDexData = this.pokeDexData.filter(pokemon => {
      const name = pokemon.name;
      return name.includes(filterString) ? pokemon : '';
    });
  }

  clearFilter(){
    this.pokeDexData = [...this.allPokemons];
    this.searchedPokemons = [];
  }
  clearPokeDex() {
    this.pokeDexData = [];
  }

  showPokemonDetails(name: string) {
    const dialogRef = this.dialog.open(PokemonDetailDialogComponent, {
      width: '600 px',
      data: name
    });
  }
}


@Component({
  templateUrl: '../pokemon-detail.component.html'
})
export class PokemonDetailDialogComponent implements OnInit {
  pokeData: any= {};
  types: any;
  abilities: any;
  moves: any;
  stats: any;

  constructor(
    private http: HttpClient,
    public dialogRef: MatDialogRef<PokemonDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogPokemonData
  ) {}

  ngOnInit() {
    return this.http
      .get<any>(`https://pokeapi.co/api/v2/pokemon/${this.data}/`)
      .subscribe( pokeData => {
        this.pokeData = pokeData;
        this.types = this.pokeData.types;
        this.abilities = this.pokeData.abilities;
        this.moves = this.pokeData.moves;
        this.stats = this.pokeData.stats
      }
      );
    
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}