import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
// Other imports
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';

import { PokemonDialogService } from './pokemon-dialog.service';



describe('PokemonDialogService ', () => {


  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let pokemonDialogService: PokemonDialogService;

  const POKEDEX_URL = 'https://pokeapi.co/api/v2/pokedex/1/';
  const POKEAPI_URL = 'https://pokeapi.co/api/v2';


  beforeEach(() => {
    TestBed.configureTestingModule({
      // Import the HttpClient mocking services
      imports: [HttpClientTestingModule],
      // Provide the service-under-test
      providers: [PokemonDialogService]
    });

    // Inject the http, test controller, and service-under-test
    // as they will be referenced by each test.
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    pokemonDialogService = TestBed.get(PokemonDialogService);
  });

  /// PokemonDialogService method tests begin ///
  describe('#getPokeDetails', () => {
    let expectedDetails;

    beforeEach(() => {
      pokemonDialogService = TestBed.get(PokemonDialogService);
      expectedDetails = [
        {
          "base_experience": 64,
          "height": 7,
          "held_items": [],
          "id": 1,
          "is_default": true,
          "name": "bulbasaur",
          "weight": 69
          
        }
      ];

    });

    // afterEach(() => {
    //   // After every test, assert that there are no more pending requests.
    //   httpTestingController.verify();
    // });

    it('should return expected pokemon details (called once)', () => {
      pokemonDialogService.getPokemonDetails(1);
      pokemonDialogService.getPokemonDetailUpdateListener().subscribe(pokemonDetails => {
        expect(pokemonDetails[0].id).toBe(expectedDetails[0].id, 'should return data with id of expected hero');
        expect(pokemonDetails.length).toBe(1, 'should only be details of 1 pokemon');
      }, fail);

      // PokemonDialogService should have made one request to GET heroes details from expected URL
      const req = httpTestingController.expectOne(POKEAPI_URL+ '/pokemon/1/');
      expect(req.request.method).toEqual('GET');

      // Respond with the mock heroes
      req.flush(expectedDetails);
    });      
  });

});
