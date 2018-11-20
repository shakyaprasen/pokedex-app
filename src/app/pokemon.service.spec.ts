import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
// Other imports
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';

import { PokemonService } from './pokemon.service';

const expected_gender = require('./gender.data.json');
const expected_habitat = require('./habitat.data.json');
const expected_region = require('./region.data.json');
const pokedex_data = require('./pokedex.data.json');

export interface Pokemon {
  entry_number: number;
  id: number;
  imageUrl: string;
  pokemon_species: {
    name: string;
    url: string;
  };
  show: boolean;
}

describe('PokemonService (with mocks)', () => {
  // 'female': 1, 'male': 2,'unknown': 3
  const GENDER_DATA = [1, 2, 3];
  // 'cave', 'forest','grassland','mountain','rare','rough-terrain','sea','urban','waters-edge'
  const HABITAT_DATA = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  // 'gen-1-johto','gen-2-johto','gen-3-hoenn','gen-4-sinnoh','gen-5-unova','gen-6-kalos','sun-moon-alola'
  const REGION_DATA = [1, 2, 3, 4, 5, 6, 7];

  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let pokemonService: PokemonService;
  const POKEDEX_URL = 'https://pokeapi.co/api/v2/pokedex/1/';
  const POKEAPI_URL = 'https://pokeapi.co/api/v2';

  beforeEach(() => {
    TestBed.configureTestingModule({
      // Import the HttpClient mocking services
      imports: [HttpClientTestingModule],
      // Provide the service-under-test
      providers: [PokemonService]
    });

    // Inject the http, test controller, and service-under-test
    // as they will be referenced by each test.
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    pokemonService = TestBed.get(PokemonService);
  });

  /// PokemonService method tests begin ///
  describe('#getPokeDexData', () => {
    let expectedPokemons: Pokemon[];

    beforeEach(() => {
      pokemonService = TestBed.get(PokemonService);
      expectedPokemons = [
        {
          entry_number: 1,
          id: 1,
          imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
          pokemon_species: {
            name: 'bulbasaur',
            url: 'https://pokeapi.co/api/v2/pokemon-species/1/'
          },
          show: false
        },
        {
          entry_number: 2,
          id: 2,
          imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png',
          pokemon_species: {
            name: 'ivysaur',
            url: 'https://pokeapi.co/api/v2/pokemon-species/2/'
          },
          show: false
        }
      ] as Pokemon[];

      pokemonService.getPokeDex();
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected pokemons (called once)', () => {
      pokemonService.getPokeDexUpdateListener().subscribe(pokemons => {
        expect(pokemons).toContain(expectedPokemons, 'should return expected heroes');
        expect(pokemons.length).toBe(expectedPokemons.length, 'number of items should be equal');
      }, fail);

      // PokemonService should have made one request to GET heroes from expected URL
      const req = httpTestingController.expectOne(POKEDEX_URL);
      expect(req.request.method).toEqual('GET');

      // Respond with the mock heroes
      req.flush(expectedPokemons);
    });

    it('should be OK returning no heroes', () => {
      pokemonService
        .getPokeDexUpdateListener()
        .subscribe(pokemons => expect(pokemons.length).toEqual(0, 'should have empty heroes array'), fail);

      const req = httpTestingController.expectOne(POKEDEX_URL);
      req.flush([]); // Respond with no heroes
    });
  });

  describe('#getGenderData, #getHabitatData, #getRegionData', () => {
    beforeEach(() => {
      pokemonService = TestBed.get(PokemonService);
    });

    it('should return expected gender data ', () => {
      GENDER_DATA.forEach((item, index, arr) => {
        pokemonService.getGenderData(item);
      });

      pokemonService.getGenderDataListener().subscribe(gender => {
        const gen = [gender];
        expect(gen[0].id).toBe(expected_gender[0].id, 'the first expected gender id should be same');
        expect(gen[0].name).toBe(expected_gender[0].name, 'the first expected gender name should be same');
      }, fail);
      // PokemonService should have made one request to GET gender from expected URL
      const req = httpTestingController.expectOne(`${POKEAPI_URL}/gender/1/`);
      expect(req.request.method).toEqual('GET');
      // Respond with the mock gender
      req.flush(expected_gender[0]);
    });

    it('should return expected habitat ', () => {
      HABITAT_DATA.forEach((item, index, arr) => {
        pokemonService.getHabitatData(item);
      });
      pokemonService.getHabitatDataListener().subscribe(habitat => {
        const hab = [habitat];
        expect(hab[0].id).toBe(expected_habitat[0].id, 'the first expected habitat id should be same');
        expect(hab[0].name).toBe(expected_habitat[0].name, 'the first expected habitat name should be same');
      }, fail);

      // PokemonService should have made one request to GET habitat from expected URL
      const req = httpTestingController.expectOne(`${POKEAPI_URL}/pokemon-habitat/1/`);
      expect(req.request.method).toEqual('GET');
      // Respond with the mock habitat
      req.flush(expected_habitat[0]);
    });

    it('should return expected region ', () => {
      REGION_DATA.forEach((item, index, arr) => {
        pokemonService.getRegionData(item);
      });
      pokemonService.getRegionDataListener().subscribe(region => {
        const reg = [region];
        expect(reg[0].id).toBe(expected_region[0].id, 'the first expected region id should be same');
        expect(reg[0].name).toBe(expected_region[0].name, 'the first expected region name should be same');
      }, fail);

      // PokemonService should have made one request to GET region from expected URL
      const req = httpTestingController.expectOne(`${POKEAPI_URL}/region/1/`);
      expect(req.request.method).toEqual('GET');
      // Respond with the mock region
      req.flush(expected_region[0]);
    });
  });

  describe('#searchByGender', () => {
    let expectedPokemons: Pokemon[];

    beforeEach(() => {
      pokemonService = TestBed.get(PokemonService);
      expectedPokemons = [
        {
          entry_number: 81,
          pokemon_species: {
            name: 'magnemite',
            url: 'https://pokeapi.co/api/v2/pokemon-species/81/'
          },
          id: 81,
          imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/81.png',
          show: false
        }
      ] as Pokemon[];
    });
    //call with genderless gender search parameter should contain magnemite pokemon
    it('should contain magnemite pokemon for genderless search string parameters', () => {
      const searchResults = pokemonService.searchByGender(pokedex_data, 'genderless', expected_gender);
      expect(searchResults).not.toBeUndefined('genderless search Param should not be undefined');
      expect(searchResults[0].id).toBe(expectedPokemons[0].id, 'genderless search should contain magnemite');
    });
  });
  describe('#searchByhabitat', () => {
    let expectedPokemons: Pokemon[];

    beforeEach(() => {
      pokemonService = TestBed.get(PokemonService);
      expectedPokemons = [
        {
          entry_number: 41,
          pokemon_species: {
            name: 'zubat',
            url: 'https://pokeapi.co/api/v2/pokemon-species/41/'
          },
          id: 41,
          imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/41.png',
          show: false
        }
      ] as Pokemon[];
    });

    //call with cave habitat search parameter should contain magnemite pokemon
    it('should contain magnemite pokemon for cave search string parameters', () => {
      const searchResults = pokemonService.searchByHabitat(pokedex_data, 'cave', expected_habitat);
      console.log(searchResults);
      expect(searchResults).not.toBeUndefined('cave habitat search Param should not be undefined');
      expect(searchResults[0].id).toBe(expectedPokemons[0].id, 'cave search should contain magnemite');
    });
  });
  describe('#searchByRegion', () => {
    let expectedPokemons: Pokemon[];

    beforeEach(() => {
      pokemonService = TestBed.get(PokemonService);
      expectedPokemons = [
        {
          entry_number: 1,
          pokemon_species: {
            name: 'bulbasaur',
            url: 'https://pokeapi.co/api/v2/pokemon-species/1/'
          },
          id: 1,
          imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
          show: false
        }
      ] as Pokemon[];
    });

    //call with kanto region search parameter should contain magnemite pokemon
    it('should contain magnemite pokemon for kanto search string parameters', () => {
      const searchResults = pokemonService.searchByRegion(pokedex_data, 'kanto', expected_region);
      expect(searchResults).not.toBeUndefined('kanto search Param should not be undefined');
      expect(searchResults[0].id).toBe(expectedPokemons[0].id, 'kanto search should contain magnemite');
    });
  });
});
