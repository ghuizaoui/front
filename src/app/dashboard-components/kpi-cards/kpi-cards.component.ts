import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Kpi } from '../../models/kpi';

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  templateUrl: './kpi-cards.component.html',
  styleUrls: ['./kpi-cards.component.css'],
  imports: [CommonModule],
})
export class KpiCardsComponent implements OnChanges {
  @Input() kpis: Kpi[] = [];  
  @Input() errorMessage: string | null = null; 
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['kpis'] && this.kpis.length > 0) {
      console.log("this is from kpi component: ", this.kpis);
    }
  }
}