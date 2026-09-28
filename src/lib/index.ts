// place files you want to import through the `$lib` alias in this folder.

// Sættes i hånden. Cyklus: 'upcoming' → 'open' → 'closed' → 'held' → (ny dato) 'upcoming'
export type SignupState = 'upcoming' | 'open' | 'closed' | 'held';

// Arrangøruddannelse & planlægningsweekend — styrer både forsidens senior-sektion og tilmeldingssiden.
export const planningState = 'held' as SignupState;
