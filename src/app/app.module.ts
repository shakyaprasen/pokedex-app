import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatCardModule,
  MatButtonModule,
  MatDialogModule,
  MatExpansionModule,
  MatInputModule,
  MatStepperModule,
  MatProgressBarModule
} from '@angular/material';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PokemonListComponent, PokemonDetailDialogComponent } from './pokemon-list/pokemon-list.component';
import { HeaderComponent } from './header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    PokemonListComponent,
    HeaderComponent,
    PokemonDetailDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatInputModule,
    MatStepperModule,
    MatProgressBarModule
  ],
  entryComponents: [PokemonDetailDialogComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
