import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

const POKEAPI_URL = 'https://pokeapi.co/api/v2';

@Injectable({ providedIn: 'root' })
export class PokemonDialogService {
	private pokemonDetailUpdated = new Subject<any>();

	constructor(private http: HttpClient) {}
	

	getPokemonDetailUpdateListener() {
		return this.pokemonDetailUpdated.asObservable();
	}

	getPokemonDetails(data){
		return this.http.get<any>(`${POKEAPI_URL}/pokemon/${data}/`).subscribe(pokeData => {
	    this.pokemonDetailUpdated.next(pokeData);
	  });
	}

}