import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { catchError, Subject, takeUntil, throwError } from 'rxjs';
import { MultiSeries } from '@swimlane/ngx-charts';
import { Olympic } from 'src/app/core/models/Olympic';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
})
export class CountryComponent implements OnInit, OnDestroy {
  public countryName: string = this.route.snapshot.params['country'];
  public medals: number = 0;
  public athletes: number = 0;
  public participations: number = 0;
  public data: MultiSeries = [];
  public loading = true;
  public error = '';

  public yMin = 0;
  public yMax = 0;

  private Y_DELTA = 10;
  private destroy$!: Subject<boolean>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private olympicService: OlympicService
  ) {}

  ngOnInit(): void {
    this.destroy$ = new Subject<boolean>();
    this.olympicService
      .getCountryByName(this.countryName)
      .pipe(
        catchError((err) => {
          this.error = err?.message;
          if (err?.message === 'Country not found') {
            this.router.navigate(['/not-found']);
          }
          return throwError(() => new Error(err?.message));
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (olympic) => this.handleSubscription(olympic),
        error: (err) => console.error(err?.message),
      });
  }

  handleSubscription(olympic: Olympic) {
    this.participations = this.olympicService.getCountryParticipations(olympic);

    this.medals = this.olympicService.getCountryTotalMedals(olympic);
    this.athletes = this.olympicService.getCountryTotalAthletes(olympic);
    this.data = this.olympicService.getCountryData(olympic);

    this.yMin = this.olympicService.getLessMedalYears(olympic) - this.Y_DELTA;
    this.yMax = this.olympicService.getMaxMedalYears(olympic) + this.Y_DELTA;
    this.loading = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
