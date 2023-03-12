import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Olympic } from 'src/app/core/models/Olympic';
import { catchError, Observable, of, Subject, takeUntil } from 'rxjs';
import { MultiSeries } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
})
export class CountryComponent implements OnInit, OnDestroy {
  olympic$: Observable<Olympic> = of({
    country: '',
    id: 0,
    participations: [],
  });
  totalMedals$!: Observable<number>;
  totalAthletes$!: Observable<number>;
  countryParticipations$!: Observable<number>;
  countryName: string = this.route.snapshot.params['country'];
  data$: Observable<MultiSeries> = of([]);
  error = '';

  destroy$!: Subject<boolean>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private olympicService: OlympicService
  ) {}

  ngOnInit(): void {
    this.destroy$ = new Subject<boolean>();
    this.olympic$ = this.olympicService.getCountryByName(this.countryName);

    this.olympic$
      .pipe(
        catchError((err, caught) => {
          this.error = err?.message;
          if (err?.message === 'Country not found') {
            this.router.navigate(['/not-found']);
          }

          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.countryParticipations$ = this.olympicService.getCountryParticipations(
      this.countryName
    );

    this.totalMedals$ = this.olympicService.getCountryTotalMedals(
      this.countryName
    );
    this.totalAthletes$ = this.olympicService.getCountryTotalAthletes(
      this.countryName
    );

    this.data$ = this.olympicService.getCountryData(this.countryName);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
