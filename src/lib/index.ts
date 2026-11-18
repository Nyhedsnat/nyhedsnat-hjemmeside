// place files you want to import through the `#lib` alias in this folder.

// Sættes i hånden. Cyklus: 'upcoming' → 'open' → 'closed' → 'held' → (ny dato) 'upcoming'
export type SignupState = 'upcoming' | 'open' | 'closed' | 'held';

// Arrangøruddannelse & planlægningsweekend — styrer både forsidens senior-sektion og tilmeldingssiden.
export const planningState = 'upcoming' as SignupState;

// Selve NyhedsNat — styrer tilmeldingssiden og "Tilmeld jer nu"-knapperne på forsiden og /program.
export const nyhedsnatState = 'upcoming' as SignupState;

// Skolen bookes først i uge 40. null = ikke annonceret endnu; skriv navnet ind, når skolen er booket (fx 'Rundhøjskolen').
export const schoolName = null as string | null;
// Bruges i løbende tekst: "Nyhedsnat foregår {venue}."
export const venue = schoolName ? `på ${schoolName} i Aarhus Syd` : 'på en skole i Aarhus Syd, som annonceres i uge 40';
// Kort etiket til faktalinjer og JSON-LD.
export const venueLabel = schoolName ? `${schoolName}, Aarhus Syd` : 'Skole i Aarhus Syd - annonceres i uge 40';
