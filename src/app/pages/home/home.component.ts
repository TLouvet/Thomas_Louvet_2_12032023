import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  DataItem,
  PieArcComponent,
  SingleSeries,
  Tooltip,
} from '@swimlane/ngx-charts';
import { Observable, of, Subscription, tap, catchError } from 'rxjs';
import { Olympic } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public olympics$: Observable<Olympic[]> = of<Olympic[]>([]);
  public maxParticipations: Observable<number> = of(0);
  public data$: Observable<SingleSeries> = of([]);

  constructor(private olympicService: OlympicService, private router: Router) {}

  ngOnInit(): void {
    this.olympics$ = this.olympicService.getOlympics();
    this.maxParticipations = this.olympicService.getMaxParticipations();
    this.data$ = this.olympicService.getHomeData();
  }

  setTooltip(text: PieArcComponent) {
    return `<p>${text.data.name}</p>
    <p>${text.data.value} medals</p>`;
  }

  onSelect(event: DataItem) {
    this.router.navigateByUrl(`/country/${event.name}`);
  }
}
