import { NgModule } from '@angular/core';
import {
  MatCardModule,
  MatButtonModule,
  MatDialogModule,
  MatExpansionModule,
  MatInputModule,
  MatStepperModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSelectModule
} from '@angular/material';

@NgModule({
  exports: [
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatInputModule,
    MatStepperModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ]
})
export class AngularMaterialModule {}
