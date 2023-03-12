import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'home-card',
  templateUrl: './home-card.component.html',
  styleUrls: ['./home-card.component.scss'],
})
export class HomeCardComponent implements OnInit {
  @Input() title: string = '';
  @Input() value: number | null = 0;

  constructor() {}

  ngOnInit(): void {}
}
