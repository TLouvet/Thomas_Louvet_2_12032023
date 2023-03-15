import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MultiSeries, SingleSeries } from '@swimlane/ngx-charts';
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
      catchError((error) => {
        console.error(error);
        this.error = error;
        this.olympics$.next([]);
        return throwError(() => new Error(error.message));
      })
    );
  }

  // Main Page Data
  getOlympics(): Observable<Olympic[]> {
    return this.olympics$.asObservable().pipe(
      tap(() => {
        if (this.error) {
          throw new Error('An error occured while loading');
        }
      })
    );
  }

  getMaxParticipations(olympics: Olympic[]) {
    const participations = olympics.map(
      (olympic) => olympic.participations.length
    );
    return Math.max(...participations);
  }

  getHomeData(olympics: Olympic[]): SingleSeries {
    return olympics.map((olympic) => ({
      name: olympic.country,
      value: olympic.participations.reduce(
        (acc, curr) => acc + curr.medalsCount,
        0
      ),
    }));
  }

  // Single country data
  getCountryByName(country: string) {
    return this.olympics$.pipe(
      map((olympics) => {
        // Would be an error on first load
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

  getCountryParticipations(olympic: Olympic) {
    return olympic.participations.length;
  }

  getCountryTotalMedals(olympic: Olympic) {
    return this.getCountryValue(olympic, 'medalsCount');
  }

  getCountryTotalAthletes(olympic: Olympic) {
    return this.getCountryValue(olympic, 'athleteCount');
  }

  getCountryData(olympic: Olympic): MultiSeries {
    const formattedData = this.formatCountryData(olympic);
    return Array(formattedData);
  }

  getLessMedalYears(olympic: Olympic) {
    const medals = olympic.participations.map((p) => p.medalsCount);
    return Math.min(...medals);
  }

  getMaxMedalYears(olympic: Olympic) {
    const medals = olympic.participations.map((p) => p.medalsCount);
    return Math.max(...medals);
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

  private getCountryValue(country: Olympic, key: keyof Participation) {
    return country.participations.reduce((a, b) => a + Number(b[key]), 0);
  }
}
