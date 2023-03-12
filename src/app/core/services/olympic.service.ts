import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DataItem, MultiSeries, SingleSeries } from '@swimlane/ngx-charts';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Olympic } from '../models/Olympic';
import { Participation } from '../models/Participation';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private olympics$ = new BehaviorSubject<Olympic[]>([]);
  private error = null;
  constructor(private http: HttpClient) {}

  loadInitialData() {
    return this.http.get<Olympic[]>(this.olympicUrl).pipe(
      tap((value) => this.olympics$.next(value)),
      catchError((error, caught) => {
        console.error(error);
        this.error = error;
        this.olympics$.next([]);
        return throwError(() => new Error(error.message));
      })
    );
  }

  // Main Page Data
  getOlympics(): Observable<Olympic[]> {
    return this.olympics$.asObservable();
  }

  getMaxParticipations() {
    return this.olympics$.pipe(
      map((olympics) =>
        Math.max(...olympics.map((olympic) => olympic.participations.length))
      )
    );
  }

  getHomeData(): Observable<SingleSeries> {
    return this.olympics$.pipe(
      map((olympics) => {
        return olympics.map((olympic) => ({
          name: olympic.country,
          value: olympic.participations.reduce(
            (acc, curr) => acc + curr.medalsCount,
            0
          ),
        }));
      })
    );
  }

  // Single country data
  getCountryByName(country: string) {
    return this.olympics$.pipe(
      map((olympics) => {
        if (this.error) {
          throw new Error('An error occured while loading data');
        }

        // No data loaded yet (first load)
        if (olympics.length === 0) {
          return {} as Olympic;
        }

        // Look for the country
        const olympic = olympics.find((olympic) => olympic.country === country);
        if (!olympic) {
          throw new Error('Country not found');
        }

        return olympic;
      })
    );
  }

  getCountryParticipations(country: string) {
    return this.olympics$.pipe(
      map((olympics) => {
        const selectedCountry = this.findCountry(olympics, country);
        if (!selectedCountry) {
          return 0;
        }
        return selectedCountry.participations.length;
      })
    );
  }

  getCountryTotalMedals(country: string) {
    return this.olympics$.pipe(
      map((olympics) => {
        const selectedCountry = this.findCountry(olympics, country);
        if (!selectedCountry) {
          return 0;
        }
        return this.getCountryValue(selectedCountry, 'medalsCount');
      })
    );
  }

  getCountryTotalAthletes(country: string) {
    return this.olympics$.pipe(
      map((olympics) => {
        const selectedCountry = this.findCountry(olympics, country);
        if (!selectedCountry) {
          return 0;
        }
        return this.getCountryValue(selectedCountry, 'athleteCount');
      })
    );
  }

  getCountryData(country: string): Observable<MultiSeries> {
    return this.olympics$.pipe(
      map((olympics) => {
        const selectedCountry = this.findCountry(olympics, country);
        if (!selectedCountry) {
          return [];
        }
        const formattedData = this.formatCountryData(selectedCountry);
        return Array(formattedData);
      })
    );
  }

  private formatCountryData(country: Olympic) {
    return {
      name: country.country,
      series: country.participations.map((participation) => {
        return {
          name: String(participation.year),
          value: participation.medalsCount,
        };
      }),
    };
  }

  private findCountry(countries: Olympic[], country: string) {
    return countries.find((c) => c.country === country);
  }

  private getCountryValue(country: Olympic, key: string) {
    return country.participations.reduce(
      (a, b) => a + Number(b[key as keyof Participation]),
      0
    );
  }
}
