import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { DialogPokemonData } from './pokemon-dialog.model';
import { PokemonDialogService } from './pokemon-dialog.service';

// Pokemon details dialog box component
@Component({
  templateUrl: './pokemon-detail.component.html',
  styleUrls: ['./pokemon-detail.component.css']
})
export class PokemonDetailDialogComponent implements OnInit, OnDestroy {
  pokeData = [];
  isDialogLoading = true;
  private detailSubs: Subscription;

  constructor(
    private pokemonDialogService: PokemonDialogService,
    private http: HttpClient,
    public dialogRef: MatDialogRef<PokemonDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogPokemonData
  ) {}

  ngOnInit() {
    this.pokemonDialogService.getPokemonDetails(this.data);
    this.detailSubs = this.pokemonDialogService.getPokemonDetailUpdateListener().subscribe(pokeData => {
      this.pokeData = pokeData;
      this.isDialogLoading = false;
    });
  }

  ngOnDestroy() {
    this.detailSubs.unsubscribe();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
