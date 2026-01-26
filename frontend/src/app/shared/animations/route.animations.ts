import { animate, group, query, style, transition, trigger } from '@angular/animations';

const slideLeft = [
  style({ position: 'relative' }),
  query(':enter, :leave', [
    style({
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
    }),
  ]),
  query(':enter', [style({ left: '100%' })]),
  query(':leave', [style({ left: '0%' })], { optional: true }),
  group([
    query(':leave', [animate('300ms ease-out', style({ left: '-100%' }))], {
      optional: true,
    }),
    query(':enter', [animate('300ms ease-out', style({ left: '0%' }))]),
  ]),
];

const slideRight = [
  style({ position: 'relative' }),
  query(':enter, :leave', [
    style({
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
    }),
  ]),
  query(':enter', [style({ left: '-100%' })]),
  query(':leave', [style({ left: '0%' })], { optional: true }),
  group([
    query(':leave', [animate('300ms ease-out', style({ left: '100%' }))], {
      optional: true,
    }),
    query(':enter', [animate('300ms ease-out', style({ left: '0%' }))]),
  ]),
];

export const routeTransition = trigger('routeTransition', [
  transition('LandingPage => SignInPage', slideLeft),
  transition('SignInPage => LandingPage', slideRight),
  transition('LandingPage => SignUpPage', slideLeft),
  transition('SignUpPage => LandingPage', slideRight),
  transition('SignInPage => SignUpPage', slideLeft),
  transition('SignUpPage => SignInPage', slideRight),
]);
