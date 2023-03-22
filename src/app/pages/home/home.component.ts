import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { DataItem, SingleSeries } from '@swimlane/ngx-charts';
import {
  Observable,
  of,
  Subject,
  takeUntil,
  catchError,
  throwError,
} from 'rxjs';
import { Olympic } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  public olympics$: Observable<Olympic[]> = of<Olympic[]>([]);

  public maxParticipations = 0;
  public countries = 0;
  public data: SingleSeries = [];
  public loading = true;
  public error = '';
  private destroy$!: Subject<boolean>;

  constructor(private olympicService: OlympicService, private router: Router) {}

  @HostListener('click', ['$event'])
  onLabelClick(event: MouseEvent) {
    const x = event.target as HTMLElement;
    if (x.tagName === 'text') {
      const country = x.innerHTML.trim();
      this.router.navigateByUrl(`/country/${country}`);
    }
  }

  ngOnInit(): void {
    this.destroy$ = new Subject<boolean>();

    this.olympics$ = this.olympicService.getOlympics();

    this.olympics$
      .pipe(
        catchError((err) => {
          this.error = err?.message;
          return throwError(() => new Error(err?.message));
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (olympics) => this.handleSubscription(olympics),
        error: (err) => this.handleError(err),
      });
  }

  handleSubscription(olympics: Olympic[]) {
    this.maxParticipations = this.olympicService.getMaxParticipations(olympics);
    this.data = this.olympicService.getHomeData(olympics);
    this.countries = olympics.length;
    this.loading = false;
  }

  handleError(error: Error) {
    console.error(error?.message);
    this.loading = false;
  }

  onSelect(event: DataItem) {
    this.router.navigateByUrl(`/country/${event.name}`);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
