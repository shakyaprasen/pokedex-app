import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpClient } from '@angular/common/http';

import { DialogPokemonData } from './pokemon-dialog.model';

const POKEAPI_URL = 'https://pokeapi.co/api/v2';

// Pokemon details dialog box component
@Component({
  templateUrl: './pokemon-detail.component.html',
  styleUrls: ['./pokemon-detail.component.css']
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
    return this.http.get<any>(`${POKEAPI_URL}/pokemon/${this.data}/`).subscribe(pokeData => {
      this.pokeData = pokeData;
      this.isDialogLoading = false;
    });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
