/**
 * Dati su uffici giudiziari di Napoli (Tribunale + Corte d'Appello).
 *
 * Estratti dai siti istituzionali (ultimo aggiornamento: 17/11/2026):
 *  - Tribunale: https://tribunale-napoli.giustizia.it/it/uffici_e_cancellerie.page
 *    (magistrati: sezione_civile_magistrati.page, sezione_penale_magistrati.page;
 *     uffici: area_amministrativa.page; dislocazione: dislocazione_uffici.page)
 *  - CA Napoli: https://ca-napoli.giustizia.it/it/uff_e_cancel_cort_app.page
 *    (magistrati: presidenti_coordinatori.page, area_i.page, settore_lavoro.page,
 *     settore_penale.page; uffici: contatti_corte_appello.page)
 *
 * Strutture: magistrati (con sezione, ruolo, tipo togato/onorario),
 * cancellerie/uffici (con torre, piano, responsabile, tel, email, PEC)
 * e dislocazione settori per torre/piano.
 */

export interface Magistrato {
  sezione: string;
  nome: string;
  cognome: string;
  ruolo: string;
  tipo: 'Togato' | 'Onorario' | 'Esperto';
  note?: string;
  /** Piano dell'aula (Torre A del Tribunale, se applicabile) */
  piano?: string;
  /** Torre dell'edificio (es. "A", "B", "C") */
  torre?: string;
  /** Giorni di udienza tipici (per la sezione lavoro Tribunale Napoli) */
  giorniUdienza?: string;
}

export interface UfficioInfo {
  numero?: number;
  nome: string;
  torre?: string;
  piano?: string;
  responsabile?: string;
  telefono?: string;
  email?: string;
  pec?: string;
  note?: string;
}

export interface Dislocazione {
  ufficio: string;
  torre: string;
  piano: string;
  note?: string;
}

export interface UfficioGiudiziarioConfig {
  id: string;
  label: string;
  shortLabel: string;
  sede: string;
  telefono?: string;
  pec?: string;
  email?: string;
  magistrati: Magistrato[];
  /** Macro-area giurisdizione per filtrare i magistrati */
  magistratiAree: { id: string; label: string; sezioniPrefix?: string[]; sezioniInclude?: string[] }[];
  uffici: UfficioInfo[];
  dislocazione?: Dislocazione[];
  vertici?: { nome: string; cognome: string; ruolo: string; note?: string }[];
}

// =============================================================
// TRIBUNALE DI NAPOLI
// =============================================================

const T_MAG: Magistrato[] = [];
const tAdd = (sez: string, full: string, ruolo: string, tipo: Magistrato['tipo'] = 'Togato', note?: string) => {
  const parts = full.trim().split(' ');
  const cognome = parts.length >= 2 ? parts[parts.length - 1] : full;
  const nome = parts.length >= 2 ? parts.slice(0, -1).join(' ') : '';
  T_MAG.push({ sezione: sez, nome, cognome, ruolo, tipo, note });
};

// Civili
let s = "Sez. 01 - Famiglia";
tAdd(s, "Raffaele Sdino", "Presidente di Sezione", "Togato", "Affari civili contenziosi e non contenziosi - Affari del Giudice Tutelare");
["Paolo Napolitano","Rossella Di Palo","Immacolata Cozzolino","Gabriella Ferrara","Viviana Criscuolo","Rosaria Gatti","Eva Scalfati","Nadia Zampogna","Giulia D'Alessandro","Ivana Sassi","Manuela Massimo Esposito","Alessio Marfe'"].forEach(n => tAdd(s, n, "Giudice"));
["Antonio La Marca","Ilaria Caserta"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Sez. 02 - Civile";
tAdd(s, "Nunzia Tesone", "Presidente Coordinatore - Presidente F.F.");
["Monica Marrazzo","Giuseppe Fiengo","Maria Gabriella Frallicciardi","Roberta Guardasole","Giovanni Tedesco"].forEach(n => tAdd(s, n, "Giudice"));
["Aldo Aratro","Raffaella D'Angelo","Vincenzo Scalzone"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Sez. 03 - Civile / Tribunale Imprese";
tAdd(s, "Leonardo Pica", "Presidente di Sezione");
["Mario Fucito","Gian Piero Scoppa","Valerio Colandrea","Arminio Salvatore Rabuano","Maria Tuccillo","Ulisse Forziati","Maria Carolina De Falco","Giuliana Santa Trotta"].forEach(n => tAdd(s, n, "Giudice"));

s = "Sez. 04 - Civile";
tAdd(s, "Roberta Di Clemente", "Presidente di Sezione");
["Biancamaria Pisciotta","Pasquale Pirone","Manuela Robustella","Valentina Valletta","Benedetta Ferone","Ettore Pastore Alinante"].forEach(n => tAdd(s, n, "Giudice"));
["Stefania Aulicino","Antonio Carleo","Pasquale Cognetta","Emanuele Lombardi"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Sez. 05 - Esecuzioni Immobiliari";
tAdd(s, "Roberto Peluso", "Presidente di Sezione");
["Maria Luisa Buono","Guglielmo Manera","Mario Ciccarelli","Elisa Asprone","Linda Catagna"].forEach(n => tAdd(s, n, "Giudice"));
["Rosanna Acampora","Teresa Addeo","Angelo Beatrice","Giulio Calogero","Ernesto Di Vaio","Alba Stefania Farina","Pasquale Fedele","Stefania Pisciotta","Fausta Sorrentino","Arianna Speranza"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Sez. 06 - Civile";
tAdd(s, "Ciro Caccaviello", "Presidente di Sezione", "Togato", "Presidente per il Comitato per l'iscrizione e la cancellazione dall'albo CTU");
["Luigia Franzese","Anna Maria Diana","Silvia Blasi","Rosamaria Ragosta"].forEach(n => tAdd(s, n, "Giudice"));
["Michele D'Auria","Giovanni Giordano","Luigi Manzi"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Sez. 07 - Fallimentare";
tAdd(s, "Paolo Celentano", "Presidente di Sezione");
["Edmondo Cacace","Marco Pugliese","Loredana Ferrara","Ilaria Grimaldi","Francesca Reale","Giovanni Di Giorgio"].forEach(n => tAdd(s, n, "Giudice"));

s = "Sez. 08 - Civile";
tAdd(s, "Pietro Lupi", "Presidente di Sezione");
["Claudia Colicchio","Nicoletta Calise","Francesca Console","Fiammetta Lo Bianco","Fabio Lombardo","Roberta De Luca"].forEach(n => tAdd(s, n, "Giudice"));
["Giovanni D'Istria","Nicola Manganelli"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Sez. 09 - Civile";
tAdd(s, "Marcello Sinisi", "Presidente di Sezione");
["Rosa Romano Cesareo","Angelo Pizzi Felice","Enrico Ardituro","Vincenzo Trinchillo","Grazia Bisogni"].forEach(n => tAdd(s, n, "Giudice"));
["Giovanni Lanzaro","Maria Esposito"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Sez. 10 - Civile";
tAdd(s, "Francesco Pastore", "Presidente di Sezione");
["Marcello Amura","Nicola Mazzocca","Anna Maria Pezzullo","Renata Palmieri","Gian Piero Vitale"].forEach(n => tAdd(s, n, "Giudice"));
["Maria Corvino","Maria Esposito","Maria Rosaria Spina"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Sez. 11 - Civile";
tAdd(s, "Giovanni Scotto di Carlo", "Presidente di Sezione");
["Carla Sorrentini","Flora Vollero","Fabio Perrella","Barbara Tango","Vincenzo Pappalardo"].forEach(n => tAdd(s, n, "Giudice"));
["Paolino Bonavita","Maria Archetta Cappiello","Claudio Marsala","Concetta Menale","Filippo Peluso","Angela Ronconi"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Sez. 12 - Civile";
tAdd(s, "Antonio Attanasio", "Presidente di Sezione");
["Mauro Impresa","Diana Rotondaro","Luigia Stravino","Barbara Gargia","Alessia Notaro"].forEach(n => tAdd(s, n, "Giudice"));
["Filomena Fiore","Raffaele Grimaldi","Paolo Madonna","Annalisa Speranza","Alfonso Tinto","Lucia Vietri"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Sez. 13 - Civile / Immigrazione";
tAdd(s, "Mario Suriano", "Presidente di Sezione");
["Marida Corso","Stefania Starace","Cristina Correale","Giovanna Caso","Cristina Capone","Martina Castaldo","Simona Capurso","Angela Arena","Diego Ragozini","Valeria Conforti","Fabiana Ucchiello"].forEach(n => tAdd(s, n, "Giudice"));
["Adele Granata","Pasquale Amendola","Andrea Pianese","Mattia Palumbo","Francesco Russo","Maria Silvia De Luca"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario", "Ufficio per il Processo Stralcio (art. 16 d.l. 100/2026)"));
["Marcello Marseglia","Fulvio Russo","Ivana Capone","Antonietta De Simone","Concetta Grella"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));
["Pietro Vestri","Raffaele Griffo"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario", "Ufficio per il Processo Stralcio (art. 16 d.l. 100/2026)"));

s = "Sez. 14 - Esecuzioni Mobiliari";
tAdd(s, "Francesco Abete", "Presidente di Sezione");
["Laura Martano","Federica D'Auria","Miriam Valenti","Margherita Lojodice","Manuela Granata"].forEach(n => tAdd(s, n, "Giudice"));
["Rosanna Acampora","Teresa Addeo","Angelo Beatrice","Giulio Calogero","Ernesto Di Vaio","Alba Stefania Farina","Pasquale Fedele","Stefania Pisciotta","Fausta Sorrentino","Arianna Speranza"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

// Lavoro
s = "Sez. Lavoro - Prima";
tAdd(s, "Ciro Cardellicchio", "Presidente di Sezione");
["Giuseppe Gambardella","Maria Pia Mazzocca","Stefania Borrelli","Maria Gaia Majorano","Luigi Ruoppolo","Sergio Palmieri","Martina Brizzi","Paolo Scognamiglio","Roberto De Matteis","Simona D'Auria","Gerardina Guglielmo","Anna Maria Beneduce","Fabrizio Finamore"].forEach(n => tAdd(s, n, "Giudice"));
tAdd(s, "Pierfrancesco Peluso", "Giudice Onorario", "Onorario");

s = "Sez. Lavoro - Seconda";
tAdd(s, "Maria Gallo", "Presidente di Sezione");
["Maria Rosaria Lombardi","Maria Vittoria Ciaramella","Maria Rosaria Elmino","Francesco Armato","Giovanna Picciotti","Federico Bile","Maria Lucantonio","Maria Rosaria Palumbo","Manuela Fontana","Manuela Montuori","Anna Pia Perpetua","Marta Correggia","Matilde Dell'Erario"].forEach(n => tAdd(s, n, "Giudice"));
tAdd(s, "Adele Di Lorenzo", "Giudice Onorario", "Onorario");

s = "Sez. Lavoro - Terza";
tAdd(s, "Paolo Coppola", "Presidente di Sezione");
["Roberta Manzon","Elisa Tomassi","Amalia Urzini","Alessandra Santulli","Francesca Alfano","Clara Ruggiero","Gabriella Gagliardi","Monica Galante","Laura Liguori","Anna Maria Lazzara","Carmen Maria Pigrini","Marco Ghionni Crivelli Visconti","Daniela Ammendola"].forEach(n => tAdd(s, n, "Giudice"));
tAdd(s, "Davide Mozzillo", "Giudice Onorario", "Onorario");

// Penali
s = "I Sez. Penale";
["Maria Armonia De Rosa","Federico Somma","Marianna Imbimbo","Eliana Franco","Valentina Rossi","Giuseppe Cioffi","Marco Vommaro"].forEach(n => tAdd(s, n, "Giudice"));
["Cristiana Sirabella","Cosimo Vastola","Vincenzo Catalano","Anna Cristina Falciano","Immacolata Mammalella"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "II Sez. Penale (Misure Prevenzione)";
tAdd(s, "Teresa Areniello", "Presidente di Sezione");
["Mariarosaria Orditura","Paola Faillace","Maria Vittoria Foschini","Luciano Di Transo","Giuliana Pollio","Lucia La Posta","Pietro Carola"].forEach(n => tAdd(s, n, "Giudice"));

s = "III Sez. Penale";
tAdd(s, "Elvira Russo", "Presidente di Sezione");
["Luana Romano","Amelia Primavera","Paola Pasqualina Laviano","Rosario Canciello","Anna Sofia Sellitto"].forEach(n => tAdd(s, n, "Giudice"));
["Elena Di Tommaso","Gennaro Zurolo"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));
tAdd(s, "Sergio Meo", "Giudice Onorario", "Onorario", "Co-assegnazione alla IX sezione penale");

s = "IV Sez. Penale";
tAdd(s, "Paola Piccirillo", "Presidente di Sezione");
["Giuliana Taglialatela","Ludovica Mancini","Linda D'Ancona","Sabrina Calabrese","Filippo Putaturo"].forEach(n => tAdd(s, n, "Giudice"));
["Maria Iorio","Domenico Mocerino"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "V Sez. Penale";
tAdd(s, "Mariaconcetta Sorrentino", "Presidente di Sezione");
["Alessandra Ferrigno","Laura De Stefano","Diletta Gobbo","Alba Ilaria Napolitano","Eliana Albanese"].forEach(n => tAdd(s, n, "Giudice"));
["Adele Granata","Pietro Rocco","Paola Guadagni"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "VI Sez. Penale";
tAdd(s, "Anna Laura Alfano", "Presidente di Sezione");
["Diana Bottillo","Mariangela Luzzi","Maria Adele Scaramella","Carlo Bardari"].forEach(n => tAdd(s, n, "Giudice"));
["Giovanna Carla Pasquale","Giovanni Di Cataldo","Orlando Paolella"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "VII Sez. Penale";
tAdd(s, "Marta Di Stefano", "Presidente di Sezione");
["Angelo Ambrosio","Antonio Baldassarre","Gianluigi Visco","Alberto Vecchione","Fabio Provvisier"].forEach(n => tAdd(s, n, "Giudice"));
["Angelo Nappo","Francesca Todisco","Concetta Grella","Sandra Lotti","Caterina Muti"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "VIII Sez. Penale (Riesame)";
tAdd(s, "Antonio Pepe", "Presidente di Sezione (F.F.)");
["Rosaria Maria Aufieri","Alessandra Consiglio","Francesca Ferri","Enrico Campoli","Daniela Cortucci","Nicola Marrone","Rosa De Ruggiero","Stefania Amodeo"].forEach(n => tAdd(s, n, "Giudice"));

s = "IX Sez. Penale";
tAdd(s, "Vincenzo Caputo", "Presidente di Sezione");
["Simona Cangiano","Valentina Gallo","Isabella Iaselli","Alessandro Cananzi","Luca Rossetti"].forEach(n => tAdd(s, n, "Giudice"));
["Patrizia Tesauro","Corrado Cuccurullo","Gaia Concetta Del Duca","Bruno Joudioux"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "X Sez. Penale (Riesame)";
tAdd(s, "Anna Elisa De Tollis", "Presidente di Sezione (F.F.)");
["Alessandra Cantone","Paola Lombardi","Roberta Attena","Alfonso Scermino","Raffaella De Majo","Marco Carbone","Anna Imparato","Dario Gallo","Luca Purcaro"].forEach(n => tAdd(s, n, "Giudice"));

s = "XI Sez. Penale";
tAdd(s, "Rossella Tammaro", "Presidente di Sezione (F.F.)");
["Roberta Zinno","Salvatore D'Ambrosio","Roberta Ianuario","Raffaele Muzzica"].forEach(n => tAdd(s, n, "Giudice"));
["Nicolina Gallo","Teresa Magnoni","Andrea Casella","Francesco Cavallaro"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "XII Sez. Penale (Riesame)";
tAdd(s, "Michele Mazzeo", "Presidente di Sezione");
["Paola Russo","Maria Gabriella Pepe","Angela Paolelli","Barbara Mendia","Marina Cimma","Emilia Di Palma","Giovanna Cervo","Giuseppe Sepe"].forEach(n => tAdd(s, n, "Giudice"));

s = "Corte di Assise - Prima";
tAdd(s, "Tommaso Miranda", "Presidente di Sezione");
tAdd(s, "Vito Maria Giorgio Purcaro", "Giudice", "Togato", "Competenza: Prima Sezione");
tAdd(s, "Vincenzo Caputo", "Presidente di Sezione (supplente)");
tAdd(s, "Luana Romano", "Giudice Supplente");

s = "Corte di Assise - Seconda";
tAdd(s, "Maurizio Conte", "Presidente di Sezione");
tAdd(s, "Paola Valeria Scandone", "Giudice", "Togato", "Competenza: Prima Sezione");
tAdd(s, "Marta Di Stefano", "Presidente di Sezione (supplente)");
tAdd(s, "Laura De Stefano", "Giudice Supplente");

s = "Corte di Assise - Terza";
tAdd(s, "Monica Amirante", "Presidente di Sezione");
tAdd(s, "Marzia Castaldi", "Giudice");
tAdd(s, "Paola Piccirillo", "Presidente di Sezione (supplente)");
tAdd(s, "Elvira Russo", "Giudice Supplente");

s = "Ufficio GIP/GUP";
tAdd(s, "Giulia Romanazzi", "Presidente Sezione GIP");
tAdd(s, "Orazio Rossi", "Presidente Aggiunto");
["Sabato Abagnale","Gabriella Ambrosino","Carla Bianco","Chiara Bardi","Donatella Bove","Nicoletta Campanaro","Ambra Cerabona","Alessandra Cesare","Maria Laura Ciollaro","Federica Colucci","Linda Comella","Enrico Contieri","Raffaele Coppola","Federica De Bellis","Lucia De Micco","Daniela De Nicola","Luca Della Ragione","Rosaria Dello Stritto","Marco Discepolo","Fabrizia Fiore","Marco Giordano","Valentina Giovanniello","Federica Girardi","Alessandra Grammatica","Rossella Grassi","Francesco Guerra","Maria Gabriella Iagulli","Simona Capasso","Gabriella Logozzo","Emilio Minio","Leda Rossetti","Michaela Sapio","Ivana Salvatore","Antonino Santoro","Mariano Sorrentino","Alessia Stadio","Teresa Valentino","Federica Villano","Giovanni Vinciguerra","Maria Cristina Sangiovanni","Alessandra Zingales"].forEach(n => tAdd(s, n, "Giudice GIP/GUP"));

// =============================================================
// DISLOCAZIONE AULE GIUDICI - TRIBUNALE DI NAPOLI (Torre A)
// =============================================================
// Fonte: file "Aule giudici tribunale.xlsx" e "Aule sezione lavoro Napoli.html"
// fornite dall'utente. Tutte le sezioni civili e lavoro qui mappate sono
// ubicate nella Torre A.

/** Mappa sezione civile → piano in Torre A (per le sezioni civili tutti i giudici stanno sullo stesso piano) */
const T_SEZ_PIANO_CIV: Record<string, string> = {
  "Sez. 01 - Famiglia": "17",
  "Sez. 02 - Civile": "19",
  "Sez. 03 - Civile / Tribunale Imprese": "14",
  "Sez. 04 - Civile": "20",
  "Sez. 05 - Esecuzioni Immobiliari": "13",
  "Sez. 06 - Civile": "20",
  "Sez. 07 - Fallimentare": "15",
  "Sez. 08 - Civile": "21",
  "Sez. 09 - Civile": "18",
  "Sez. 10 - Civile": "21",
  "Sez. 11 - Civile": "22",
  "Sez. 12 - Civile": "22",
  "Sez. 13 - Civile / Immigrazione": "16",
  "Sez. 14 - Esecuzioni Mobiliari": "12 e 13",
};

/**
 * Per la sezione lavoro la dislocazione è per singolo magistrato (cognome),
 * desunta dal calendario delle aule udienze lavoro. Sezioni I/II/III lavoro
 * occupano i piani 7-11 della Torre A.
 */
interface LavoroInfo { piano: string; giorniUdienza?: string }
const T_LAVORO_BY_COGNOME: Record<string, LavoroInfo> = {
  // I sezione lavoro
  "Cardellicchio": { piano: "7", giorniUdienza: "Mar, Gio" },
  "Gambardella":   { piano: "7", giorniUdienza: "Mar, Mer" },
  "Mazzocca":      { piano: "7", giorniUdienza: "Mar, Gio" },
  "Borrelli":      { piano: "8", giorniUdienza: "Mar, Gio" },
  "Majorano":      { piano: "7", giorniUdienza: "Lun, Gio" },
  "Ruoppolo":      { piano: "7", giorniUdienza: "Mar, Mer" },
  "Palmieri":      { piano: "8", giorniUdienza: "Lun, Mar" },
  "Brizzi":        { piano: "7", giorniUdienza: "Mar, Mer" },
  "Scognamiglio":  { piano: "7", giorniUdienza: "Mar, Mer" },
  "De Matteis":    { piano: "7", giorniUdienza: "Mar, Gio" },
  "D'Auria":       { piano: "7", giorniUdienza: "Mer, Gio" },
  "Beneduce":      { piano: "8", giorniUdienza: "Mar, Mer" },
  "Finamore":      { piano: "8", giorniUdienza: "Mer, Gio" },
  "Peluso":        { piano: "9", giorniUdienza: "Mar, Mer" },
  // II sezione lavoro
  "Gallo":         { piano: "9", giorniUdienza: "Mer, Gio" },
  "Lombardi":      { piano: "10", giorniUdienza: "Mer, Gio" },
  "Ciaramella":    { piano: "9", giorniUdienza: "Lun, Gio" },
  "Elmino":        { piano: "10", giorniUdienza: "Mar, Gio" },
  "Armato":        { piano: "9", giorniUdienza: "Mar, Gio" },
  "Picciotti":     { piano: "9", giorniUdienza: "Mer, Gio" },
  "Bile":          { piano: "8", giorniUdienza: "Mar, Gio" },
  "Lucantonio":    { piano: "9", giorniUdienza: "Mer, Ven" },
  "Palumbo":       { piano: "9", giorniUdienza: "Mar, Gio" },
  "Fontana":       { piano: "9", giorniUdienza: "Mar, Gio" },
  "Montuori":      { piano: "9", giorniUdienza: "Mer, Gio" },
  "Correggia":     { piano: "10", giorniUdienza: "Mar, Gio" },
  "Dell'Erario":   { piano: "8", giorniUdienza: "Mar, Mer" },
  "Di Lorenzo":    { piano: "9", giorniUdienza: "Lun, Mer" },
  // III sezione lavoro
  "Coppola":       { piano: "11", giorniUdienza: "Mar, Mer" },
  "Manzon":        { piano: "11", giorniUdienza: "Mar, Mer" },
  "Tomassi":       { piano: "11", giorniUdienza: "Mar, Gio" },
  "Urzini":        { piano: "11", giorniUdienza: "Mar, Mer" },
  "Santulli":      { piano: "10", giorniUdienza: "Mer, Gio" },
  "Alfano":        { piano: "10", giorniUdienza: "Mar, Gio" },
  "Ruggiero":      { piano: "11", giorniUdienza: "Mar, Ven" },
  "Gagliardi":     { piano: "10", giorniUdienza: "Mar, Mer" },
  "Galante":       { piano: "11", giorniUdienza: "Mer, Gio" },
  "Liguori":       { piano: "10", giorniUdienza: "Mar, Gio" },
  "Lazzara":       { piano: "11", giorniUdienza: "Mer, Gio" },
  "Ghionni Crivelli Visconti": { piano: "11", giorniUdienza: "Mer, Gio" },
  "Ammendola":     { piano: "11", giorniUdienza: "Mar, Mer" },
  "Mozzillo":      { piano: "10", giorniUdienza: "Lun, Mer" },
};

// Applica la dislocazione (Torre A) ai magistrati del Tribunale di Napoli.
// Le sezioni civili usano la mappa per sezione; la sezione lavoro è per cognome.
//
// Lookup robusto per la sezione lavoro: i cognomi composti (es. "Ghionni
// Crivelli Visconti") nel dataset sono memorizzati come stringa intera, ma
// nel modello Magistrato lo split su spazi mette solo l'ultima parola in
// cognome. Quindi confrontiamo case-insensitive sia il cognome esatto sia
// la presenza della chiave nel full-name (nome + cognome).
const _lavoroKeys = Object.keys(T_LAVORO_BY_COGNOME).map(k => ({ k, kl: k.toLowerCase() }));
T_MAG.forEach(m => {
  if (m.sezione.startsWith("Sez. Lavoro")) {
    const full = `${m.nome} ${m.cognome}`.toLowerCase();
    let info = T_LAVORO_BY_COGNOME[m.cognome];
    if (!info) {
      const hit = _lavoroKeys.find(({ kl }) =>
        full === kl || full.includes(' ' + kl) || full.startsWith(kl) || full.endsWith(' ' + kl) ||
        kl.endsWith(' ' + m.cognome.toLowerCase())
      );
      if (hit) info = T_LAVORO_BY_COGNOME[hit.k];
    }
    if (info) {
      m.torre = "A";
      m.piano = info.piano;
      m.giorniUdienza = info.giorniUdienza;
    }
    return;
  }
  const piano = T_SEZ_PIANO_CIV[m.sezione];
  if (piano) {
    m.torre = "A";
    m.piano = piano;
  }
});

const T_UFF: UfficioInfo[] = [
  { nome: "Presidenza", torre: "A", piano: "23", responsabile: "Domenico Cardullo (Direttore)", email: "presidenza.tribunale.napoli@giustizia.it", pec: "presidente.tribunale.napoli@giustiziacert.it" },
  { nome: "Dirigenza Amministrativa", torre: "A", piano: "23", responsabile: "Fabio Iappelli (Dirigente); Maria Antonietta Mazza (Direttore)", email: "prot.tribunale.napoli@giustizia.it", pec: "prot.tribunale.napoli@giustiziacert.it" },
  { nome: "Ufficio Innovazione e Protocollo", torre: "A", piano: "23", responsabile: "Antonietta Sossi (Direttore)", email: "ufficioinnovazione.tribunale.napoli@giustizia.it" },
  { nome: "Ufficio del Funzionario Delegato", torre: "B", piano: "20", responsabile: "Luisa Casillo (Funz. Contabile)", email: "funzdelegato.tribunale.napoli@giustizia.it", pec: "funzionariodelegato.tribunale.napoli@giustiziacert.it" },
  { nome: "Ufficio del Personale", torre: "A", piano: "23", responsabile: "Aldo Oliva (Direttore)", email: "ufficiopersonale.tribunale.napoli@giustizia.it", pec: "prot.tribunale.napoli@giustiziacert.it" },
  { nome: "Ufficio Recupero Crediti", torre: "A", piano: "6", responsabile: "Gemma Corazza (Funz. Contabile)", email: "recuperocrediti.tribunale.napoli@giustizia.it", pec: "recuperocrediti.tribunale.napoli@giustiziacert.it" },
  { nome: "Ufficio Spese Pagate dall'Erario", torre: "B", piano: "22", responsabile: "Assunta Buonanno (Direttore)", email: "ufficiopagamenti.tribunale.napoli@giustizia.it" },
  { nome: "Ufficio Economato, Consegnatario e Automezzi", torre: "C", piano: "1", responsabile: "Paola Ruocco; Antonio Alario (Direttori)", email: "economato.tribunale.napoli@giustizia.it", pec: "economato.tribunale.napoli@giustiziacert.it" },
  { nome: "Archivio Generale", torre: "B", piano: "1", responsabile: "Roberto Longobardi (Direttore)", email: "archiviocivile.tribunale.napoli@giustizia.it", pec: "cronologico.tribunale.napoli@giustiziacert.it" },
  { nome: "Ufficio Corpi di Reato", torre: "B", piano: "11", responsabile: "Maurizio Scudiero (Funz. Giudiziario)", email: "corpireato.tribunale.napoli@giustizia.it", pec: "corpireato.tribunale.napoli@giustiziacert.it" },
  { nome: "Centralino", torre: "Ingresso Via Grimaldi", piano: "Terra", responsabile: "Aldo Oliva (Direttore)", telefono: "0812238111; 0812238804" },
];

const T_DISL: Dislocazione[] = [
  { ufficio: "Presidenza", torre: "A", piano: "23" },
  { ufficio: "Dirigenza Amministrativa", torre: "A", piano: "23" },
  { ufficio: "Ufficio Innovazione e Protocollo", torre: "A", piano: "23" },
  { ufficio: "Ufficio del Funzionario Delegato", torre: "B", piano: "20" },
  { ufficio: "Ufficio del Personale", torre: "A", piano: "23" },
  { ufficio: "Ufficio Albi e CTU", torre: "B", piano: "6" },
  { ufficio: "Ufficio Recupero Crediti", torre: "B", piano: "6" },
  { ufficio: "Ufficio Spese pagate dall'Erario", torre: "B", piano: "22" },
  { ufficio: "Ufficio Economato Consegnatario ed Automezzi", torre: "C", piano: "1" },
  { ufficio: "Archivio Generale", torre: "B", piano: "1" },
  { ufficio: "Ufficio Corpi di Reato", torre: "B", piano: "11" },
  { ufficio: "Centralino", torre: "Ingresso Via Grimaldi", piano: "Terra" },
  { ufficio: "Segreteria Presidenza G.I.P.", torre: "B", piano: "16" },
  { ufficio: "Coordinamento G.I.P.", torre: "B", piano: "16" },
  { ufficio: "Ruolo Generale G.I.P.", torre: "B", piano: "15" },
  { ufficio: "1ª e 2ª Unità G.I.P. + 11ª Unità G.I.P.", torre: "B", piano: "12" },
  { ufficio: "3ª e 4ª Unità G.I.P. + 11ª Unità G.I.P.", torre: "B", piano: "13" },
  { ufficio: "5ª e 6ª Unità G.I.P.", torre: "B", piano: "14" },
  { ufficio: "7ª e 8ª Unità G.I.P. + 11ª G.I.P.", torre: "B", piano: "15" },
  { ufficio: "9ª e 10ª Unità G.I.P. + 11ª Unità G.I.P.", torre: "B", piano: "16" },
  { ufficio: "Ufficio Liquidazioni G.I.P.", torre: "B", piano: "11" },
  { ufficio: "Ufficio Esecuzione G.I.P.", torre: "B", piano: "12" },
  { ufficio: "Registro Generale Dibattimento", torre: "B", piano: "18" },
  { ufficio: "Coordinamento Dibattimento", torre: "B", piano: "22" },
  { ufficio: "Prima e Undicesima Sezione Penale", torre: "B", piano: "17" },
  { ufficio: "Sezione misure di prevenzione", torre: "B", piano: "23" },
  { ufficio: "Terza e Quinta Sezione Penale", torre: "B", piano: "20" },
  { ufficio: "Quarta e Settima Sezione Penale", torre: "B", piano: "18" },
  { ufficio: "Sesta e Nona Sezione Penale", torre: "B", piano: "21" },
  { ufficio: "Ufficio Impugnazioni Dibattimento", torre: "B", piano: "21" },
  { ufficio: "Ufficio Liquidazioni Dibattimento", torre: "B", piano: "21" },
  { ufficio: "Ufficio Esecuzione Dibattimento", torre: "B", piano: "17" },
  { ufficio: "Corte di Assise", torre: "B", piano: "19" },
  { ufficio: "Sezione Centralizzata Riesame", torre: "B", piano: "5" },
  { ufficio: "Sezione Riesame 8", torre: "C", piano: "5" },
  { ufficio: "Sezione Riesame 10", torre: "C", piano: "5" },
  { ufficio: "Sezione Riesame 12", torre: "C", piano: "5" },
  { ufficio: "Sezione Stralcio", torre: "B", piano: "19" },
  { ufficio: "Front Office Penale", torre: "Ingresso lato C.D.N.", piano: "Terra" },
  { ufficio: "Coordinamento Settore Civile", torre: "A", piano: "19" },
  { ufficio: "Ruolo Generale Civile", torre: "A", piano: "6" },
  { ufficio: "Prima Sezione Civile Famiglia", torre: "A", piano: "17" },
  { ufficio: "Prima Sezione Civile Giudice Tutelare", torre: "A", piano: "16" },
  { ufficio: "Sezione 2 Civile", torre: "A", piano: "19" },
  { ufficio: "Sezione 3 Civile - Tribunale Imprese", torre: "A", piano: "14" },
  { ufficio: "Sezione 4-6 Civile", torre: "A", piano: "20" },
  { ufficio: "Sezione 5 Civile - Esecuzioni Immobiliari", torre: "A", piano: "13" },
  { ufficio: "Sezione 7 Civile - Fallimentare", torre: "A", piano: "14 - 15" },
  { ufficio: "Sezione 8-10 Civile", torre: "A", piano: "21" },
  { ufficio: "Sezione 9 Civile", torre: "A", piano: "18" },
  { ufficio: "Sezione 11-12 Civile", torre: "A", piano: "22" },
  { ufficio: "Sezione 13 Civile - Immigrazione", torre: "A", piano: "16" },
  { ufficio: "Sezione 14 Civile - Esecuzioni Mobiliari", torre: "A", piano: "12" },
  { ufficio: "Ruolo Generale Sezione Lavoro", torre: "A", piano: "7" },
  { ufficio: "Sezione Lavoro", torre: "A", piano: "7 - 8 - 9 - 10 - 11" },
  { ufficio: "Archivio Sezione Lavoro", torre: "A", piano: "5" },
  { ufficio: "Struttura Centralizzata P.S.S.", torre: "A", piano: "17" },
  { ufficio: "Volontaria Giurisdizione ed Ufficio Albi", torre: "A", piano: "6" },
  { ufficio: "Ufficio repertorio e trascrizioni", torre: "A", piano: "6" },
];

export const TRIBUNALE_NAPOLI: UfficioGiudiziarioConfig = {
  id: 'tribunale-napoli',
  label: 'Tribunale di Napoli',
  shortLabel: 'Tribunale Napoli',
  sede: 'Piazza Giovanni Falcone e Paolo Borsellino 1, 80143 Napoli',
  telefono: '081 223 8111',
  email: 'prot.tribunale.napoli@giustizia.it',
  pec: 'prot.tribunale.napoli@giustiziacert.it',
  magistrati: T_MAG,
  magistratiAree: [
    { id: 'civile', label: 'Civile', sezioniPrefix: ['Sez. 0', 'Sez. 1'] },
    { id: 'lavoro', label: 'Lavoro', sezioniPrefix: ['Sez. Lavoro'] },
    { id: 'penale', label: 'Penale', sezioniInclude: ['Sez. Penale', 'Corte di Assise', 'GIP/GUP'] },
  ],
  uffici: T_UFF,
  dislocazione: T_DISL,
};

// =============================================================
// CORTE D'APPELLO DI NAPOLI
// =============================================================

const CA_MAG: Magistrato[] = [];
const cAdd = (sez: string, full: string, ruolo: string, tipo: Magistrato['tipo'] = 'Togato', note?: string) => {
  const parts = full.trim().split(' ');
  const cognome = parts.length >= 2 ? parts[parts.length - 1] : full;
  const nome = parts.length >= 2 ? parts.slice(0, -1).join(' ') : '';
  CA_MAG.push({ sezione: sez, nome, cognome, ruolo, tipo, note });
};

// Civili
s = "Prima Sez. Civile - Trib. Reg. Acque Pubbliche";
["Erminia Catapano","Angelo Del Franco","Francesco Gesue' Rizzi Ulmo","Federica Salvatore"].forEach(n => cAdd(s, n, "Consigliere"));
["Pietro Ernesto De Felice","Luigi Vinci","Massimo Fontana"].forEach(n => cAdd(s, n, "Esperto Trib. Acque Pubbliche", "Esperto"));

s = "Quinta Sez. - Sez. Specializzata Impresa";
cAdd(s, "Michelangelo Petruzziello", "Presidente Sezione");
["Caterina Di Martino","Giuseppa D'Inverno","Pasquale Russolillo"].forEach(n => cAdd(s, n, "Consigliere"));

s = "Seconda Sez. Civile";
cAdd(s, "Elvira Bellantoni", "Presidente Sezione");
["Maria Luisa Arienzo","Mariacristina Carpinelli","Paola Martorana","Maria Teresa Onorato"].forEach(n => cAdd(s, n, "Consigliere"));
["Daniela Gesmundo","Chiara Memoli","Cesare Visconti"].forEach(n => cAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Quarta Sez. Civile - Sez. Spec. Agraria";
cAdd(s, "Giuseppe De Tullio", "Presidente Sezione");
["Rosanna De Rosa","Giuseppe Gustavo Infantini","Luigi Mancini","Massimo Sensale","Francesca Sicilia"].forEach(n => cAdd(s, n, "Consigliere"));
cAdd(s, "Massimo Vincenzo Rizzi", "Giudice Onorario", "Onorario");
["Francesco Langellotti","Marco Razzano"].forEach(n => cAdd(s, n, "Esperto Sez. Agraria (Effettivo)", "Esperto"));
["Vincenzo Ambrosino","Arianna Divella"].forEach(n => cAdd(s, n, "Esperto Sez. Agraria (Supplente)", "Esperto"));

s = "Sesta Sez. Civile";
cAdd(s, "Assunta D'Amore", "Presidente Sezione");
["Regina Marina Elefante","Fabio Magistro","Ada Meterangelis","Giuseppe Vinciguerra","Marielda Montefusco"].forEach(n => cAdd(s, n, "Consigliere"));
cAdd(s, "Fabrizio Carmina", "Giudice Onorario", "Onorario");

s = "Terza Sez. Civile";
cAdd(s, "Giulio Cataldi", "Presidente Sezione");
["Michele Caccese","Maria Casaregola","Stefano Celentano","Rosaria Morrone","Maria Cristina Rizzi","Pasquale Ucci"].forEach(n => cAdd(s, n, "Consigliere"));
["Fernando Amoroso","Sandro De Paola","Massimo Torre"].forEach(n => cAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Settima Sez. Civile";
cAdd(s, "Aurelia D'Ambrosio", "Presidente Sezione");
["Monica Cacace","Paola Giglio Cobuzio","Gerardo Giuliano","Michele Magliulo","Paolo Miriani","Lucia Minauro"].forEach(n => cAdd(s, n, "Consigliere"));
["Giovanni D'Erme","Marco Marinaro"].forEach(n => cAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Ottava Sez. Civile";
cAdd(s, "Alessandro Cocchiara", "Presidente Sezione");
["Alberto Canale","Paola Mastroianni","Maria Rosaria Pupo","Massimiliano Sacchi"].forEach(n => cAdd(s, n, "Consigliere"));
cAdd(s, "Rita Anna De Falco", "Giudice Onorario", "Onorario");

s = "Nona Sez. Civile";
cAdd(s, "Eugenio Forgillo", "Presidente Sezione");
["Natalia Ceccarelli","Nicoletta Celentano","Maria Di Lorenzo","Lucia Esposito","Francesco Notaro"].forEach(n => cAdd(s, n, "Consigliere"));
["Flora De Caro","Sandro Figliozzi"].forEach(n => cAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Sez. Minorenni, Persona e Famiglia";
["Efisia Gaviano","Ornella Minucci","Stefano Risolo","Silvana Sica","Marina Tafuri"].forEach(n => cAdd(s, n, "Consigliere"));
["Maria Concetta Miranda","Fara Vozza","Antonio Virgili","Rosanna Izzo","Renato Sampogna","Aniello De Vito","Riccardo Russo","Filomena Annigliato","Antonio Bonfitto"].forEach(n => cAdd(s, n, "Giudice Onorario Minorile", "Onorario"));

// Penali (sezioni I-VI, Corte di Assise di Appello, Misure di Prevenzione)
s = "I Sez. Penale";
["Giovanni Carbone","Antonio Criscuolo Gaito","Daniela Critelli","Alberto Maria Picardi","Aldo Polizzi","Mariarosaria Stanzione","Francesca Telaro"].forEach(n => cAdd(s, n, "Consigliere"));

s = "II Sez. Penale";
["Virgilio Dante Bernardi","Maria Dolores Carapella","Carmela Iorio","Giuseppe Orso","Carla Sarno","Francesco Valentini","Fortunata Volpe"].forEach(n => cAdd(s, n, "Consigliere"));

s = "III Sez. Penale";
["Sandro Ciampaglia","Elena Conte","Francesco De Falco Giannone","Giovanna Rosa Immacolata Di Petti","Mario Roberto Gaudio","Riccardo Sena","Saverio Vertuccio"].forEach(n => cAdd(s, n, "Consigliere"));

s = "IV Sez. Penale";
["Elisabetta Catalanotti","Federica De Maio","Antonietta Golia","Alessandra Maddalena","Nicola Russo","Francesca Spella","Diego Vargas"].forEach(n => cAdd(s, n, "Consigliere"));

s = "V Sez. Penale";
cAdd(s, "Mariella Montefusco", "Presidente Sezione");
["Francesco Caramico D'Auria","Annamaria Casoria","Marcello De Chiara","Maria Delia Gaudino","Valeria Montesarchio","Andrea Rovida","Cettina Scognamiglio"].forEach(n => cAdd(s, n, "Consigliere"));

s = "VI Sez. Penale";
["Fabiana Mastrominico","Antonia Napolitano Tafuri","Nicola Erminio Paone","Roberta Troisi","Daria Vecchione"].forEach(n => cAdd(s, n, "Consigliere"));

s = "Corte Assise Appello - Prima Sezione";
cAdd(s, "Rosa Anna Saraceno", "Presidente Effettivo");
cAdd(s, "Pasquale Santaniello", "Consigliere Effettivo");
cAdd(s, "Davide Di Stasio", "Consigliere Supplente");

s = "Corte Assise Appello - Seconda Sezione";
cAdd(s, "Francesco Ciocia", "Presidente Supplente");
cAdd(s, "Davide Di Stasio", "Consigliere Effettivo");
cAdd(s, "Barbara Modesta Grasso", "Consigliere Supplente");

s = "Corte Assise Appello - Terza Sezione";
cAdd(s, "Loredana Di Girolamo", "Presidente Effettivo");
cAdd(s, "Barbara Modesta Grasso", "Consigliere Effettivo");
cAdd(s, "Vincenzo Alabiso", "Consigliere Supplente");

s = "Corte Assise Appello - Quarta Sezione";
cAdd(s, "Roberto Donatiello", "Presidente Effettivo");
cAdd(s, "Ginevra Abbamondi", "Presidente Supplente");
cAdd(s, "Vincenzo Alabiso", "Consigliere Effettivo");
cAdd(s, "Amalia Taddeo", "Consigliere Supplente");

s = "Corte Assise Appello - Quinta Sezione";
cAdd(s, "Ginevra Abbamondi", "Presidente Effettivo");
cAdd(s, "Rosa Anna Saraceno", "Presidente Supplente");
cAdd(s, "Amalia Taddeo", "Consigliere Effettivo");
cAdd(s, "Pasquale Santaniello", "Consigliere Supplente");

s = "Sez. Misure di Prevenzione";
["Maria Francica","Maria Grassi","Fernanda Iannone","Gabriella Nuzzi"].forEach(n => cAdd(s, n, "Consigliere"));

// Lavoro
s = "Sez. Lavoro - Prima Unità";
cAdd(s, "Mariavittoria Papa", "Presidente Sez. Lavoro");
["Chiara Di Benedetto","Francesca Gomez De Ayala","Giovanna Guarino"].forEach(n => cAdd(s, n, "Consigliere Sez. Lavoro"));
cAdd(s, "Carlo De Marchis", "Giudice Onorario", "Onorario");

s = "Sez. Lavoro - Seconda Unità";
cAdd(s, "Vincenza Totaro", "Presidente Sez. Lavoro");
["Arturo Avolio","Rosa Del Prete","Sebastiano Napolitano"].forEach(n => cAdd(s, n, "Consigliere Sez. Lavoro"));
cAdd(s, "Anselmo Del Fiacco", "Giudice Onorario", "Onorario");

s = "Sez. Lavoro - Terza Unità";
cAdd(s, "Piero Francesco De Pietro", "Presidente Sez. Lavoro");
["Stefania Basso","Gabriella Gentile","Antonietta Savino"].forEach(n => cAdd(s, n, "Consigliere Sez. Lavoro"));
cAdd(s, "Michela Bacchetti", "Giudice Onorario", "Onorario");

s = "Sez. Lavoro - Quarta Unità";
cAdd(s, "Gennaro Iacone", "Presidente Sez. Lavoro");
["Maria Chiodi","Milena Cortigiano","Chiara De Franco","Carmen Lombardi"].forEach(n => cAdd(s, n, "Consigliere Sez. Lavoro"));

s = "Sez. Lavoro - Quinta Unità";
cAdd(s, "Anna Carla Catalano", "Presidente Sez. Lavoro");
["Francesca Romana Amarelli","Rosa Bernardina Cristofano","Laura Laureti","Laura Scarlatelli"].forEach(n => cAdd(s, n, "Consigliere Sez. Lavoro"));
cAdd(s, "Paolo Barletta", "Giudice Onorario", "Onorario");

const CA_VERTICI = [
  { nome: "Maria Rosaria", cognome: "Covelli", ruolo: "Presidente della Corte d'Appello" },
  { nome: "Mariavittoria", cognome: "Papa", ruolo: "Presidente Vicario", note: "Coordinatore Settore Lavoro" },
  { nome: "Mariella", cognome: "Montefusco", ruolo: "Coordinatore Settore Penale" },
  { nome: "Eugenio", cognome: "Forgillo", ruolo: "Coordinatore Settore Civile" },
  { nome: "Ginevra", cognome: "Abbamondi", ruolo: "Coordinatore Sezioni Assise Appello" },
  { nome: "Alessandra", cognome: "Maddalena", ruolo: "Coordinatore Ufficio Innovazione" },
];

const CA_UFF: UfficioInfo[] = [
  { numero: 1, nome: "Centralino", torre: "Torre C", piano: "1", telefono: "0812237111" },
  { numero: 2, nome: "Ufficio del Consegnatario", torre: "Lotto 1", piano: "1", responsabile: "Gennaro Auzino", telefono: "0812232065", email: "consegnatario.ca.napoli@giustizia.it" },
  { numero: 3, nome: "Ufficio Gestione Beni e Servizi e Automezzi", torre: "Lotto 1", piano: "1", responsabile: "Gioacchino Angiolelli", telefono: "0812232071", email: "manutenzione.ca.napoli@giustizia.it", pec: "benieservizi.ca.napoli@giustiziacert.it" },
  { numero: 4, nome: "Ufficio Tessere", torre: "Lotto 1", piano: "1", responsabile: "Gioacchino Angiolelli; Salvatore Pussumato", telefono: "0812233211", email: "ufficiotessere.ca.napoli@giustizia.it" },
  { numero: 5, nome: "Ufficio Innovazione", torre: "Lotto 1", piano: "1 - 2", responsabile: "Francesco De Vivo", telefono: "0812232332", email: "ufficioinnovazionestatistico.ca.napoli@giustizia.it" },
  { numero: 6, nome: "Segreteria Consiglio Giudiziario", torre: "Lotto 1", piano: "2", responsabile: "Liliana Marzatico", telefono: "0812232006", email: "consigliogiudiz.ca.napoli@giustizia.it", pec: "segreteria.consgiud.napoli@giustiziacert.it" },
  { numero: 7, nome: "Comitato II Istanza C.T.U. e Periti Penali", torre: "Lotto 1", piano: "2", responsabile: "Luigi Civolani", telefono: "0812232070", email: "reclamictueperiti.ca.napoli@giustizia.it", pec: "reclamictu.ca.napoli@giustiziacert.it" },
  { numero: 8, nome: "Personale Magistratura Onoraria", torre: "Lotto 1", piano: "2", responsabile: "Carla Vittoria Arpaia", telefono: "0812232014", email: "magistraturaonoraria.ca.napoli@giustizia.it" },
  { numero: 9, nome: "Protocollo e Corrispondenza", torre: "Lotto 1", piano: "2", responsabile: "Gabriella Ioni", telefono: "0812232898", email: "prot.ca.napoli@giustizia.it", pec: "prot.ca.napoli@giustiziacert.it" },
  { numero: 10, nome: "Ufficio Distrettuale Presidenti di Seggio", torre: "Lotto 1", piano: "2", responsabile: "Luigi Civolani", telefono: "0812232070", email: "elettorato.ca.napoli@giustizia.it", pec: "presidentiseggio.ca.napoli@giustiziacert.it" },
  { numero: 11, nome: "Coordinatore Ufficio di Presidenza", torre: "Lotto 1", piano: "3", responsabile: "Pasquale Corrado", telefono: "0812232019" },
  { numero: 12, nome: "Segreteria Particolare del Presidente", torre: "Lotto 1", piano: "3", responsabile: "Diletta De Vivo", telefono: "0812232027", email: "presidenza.ca.napoli@giustizia.it", pec: "presidente.ca.napoli@giustiziacert.it" },
  { numero: 13, nome: "Personale Magistratura Ordinaria", torre: "Lotto 1", piano: "3", responsabile: "Matilde Scarpa", telefono: "0812232020", email: "pers.magistratura.ca.napoli@giustizia.it", pec: "presidente.ca.napoli@giustiziacert.it" },
  { numero: 14, nome: "Segreteria del Dirigente Amministrativo", torre: "Lotto 1", piano: "4", responsabile: "Ivonne De Luca", telefono: "0812233257", email: "segrsup.ca.napoli@giustizia.it", pec: "dirigente.ca.napoli@giustiziacert.it" },
  { numero: 15, nome: "Personale Amministrativo", torre: "Lotto 1", piano: "4", responsabile: "Maria Rosaria Castellano", telefono: "0812233258", email: "personale.ca.napoli@giustizia.it", pec: "personale.ca.napoli@giustiziacert.it" },
  { numero: 16, nome: "Biblioteca", torre: "Lotto 1", piano: "Terra", responsabile: "Gioacchino Angiolelli; Francesco Amodio", telefono: "0812232510", email: "biblioteca.ca.napoli@giustizia.it" },
  { numero: 17, nome: "Esami Avvocato", torre: "Lotto 1", piano: "Terra", responsabile: "Roberta Pumpo", telefono: "0812231025", email: "esamiavv.ca.napoli@giustizia.it", pec: "esamiavvocato.ca.napoli@giustiziacert.it" },
  { numero: 18, nome: "Trasmissione Atti in Cassazione", torre: "Torre A", piano: "1", responsabile: "Stefania De Falco Giannone", telefono: "0812238106", email: "ufficiocassazioneinvio.ca.napoli@giustizia.it", pec: "depositoattipenali.ca.napoli@giustiziacert.it" },
  { numero: 19, nome: "Trattazione Fascicoli da Cassazione", torre: "Torre A", piano: "1", responsabile: "Mario Paesano", telefono: "0812238078", email: "ufficiocassazioneritorno.ca.napoli@giustizia.it", pec: "ritornocassazione.ca.napoli@giustiziacert.it" },
  { numero: 20, nome: "Cancelleria Persona, Famiglia e Minori", torre: "Torre A", piano: "24", responsabile: "Caterina Mazzei", telefono: "0812239761", email: "sezpersonaefamiglia.ca.napoli@giustizia.it", pec: "famiglia.ca.napoli@giustiziacert.it" },
  { numero: 21, nome: "Ruolo Generale Civile - Repertorio - Archivio", torre: "Torre A", piano: "24", responsabile: "Antonio Rusciano", telefono: "0812239796", email: "settore.civile.ca.napoli@giustizia.it", pec: "ruologen.civile.ca.napoli@giustiziacert.it" },
  { numero: 22, nome: "Ufficio Elettorale", torre: "Torre A", piano: "24", responsabile: "Pasquale Corrado", telefono: "0812232019", email: "coordinamentoelettorale.ca.napoli@giustizia.it" },
  { numero: 23, nome: "Coordinatore Settore Civile", torre: "Torre A", piano: "24", responsabile: "Maria Iodice", telefono: "0812239787", email: "coordinamentocivile.ca.napoli@giustizia.it", pec: "coordinamentocivile.ca.napoli@giustiziacert.it" },
  { numero: 24, nome: "Recupero Crediti Civile", torre: "Torre A", piano: "24", responsabile: "Giuseppina Simonetti", telefono: "0812239792", email: "recuperocrediticivile.ca.napoli@giustizia.it", pec: "recuperocrediti.ca.napoli@giustiziacert.it" },
  { numero: 25, nome: "Prima Cancelleria Civile (I, V, Acque, Impresa)", torre: "Torre A", piano: "25", responsabile: "Flaviana Margherita D'Amico", telefono: "0812239814", email: "sez1.civile.ca.napoli@giustizia.it", pec: "sez1.civile.ca.napoli@giustiziacert.it" },
  { numero: 26, nome: "Quarta Cancelleria Civile (IV, VIII, IX, Agraria)", torre: "Torre A", piano: "26", responsabile: "Carmen Cucciniello", telefono: "0812239867", email: "sez4.civile.ca.napoli@giustizia.it", pec: "sez4.civile.ca.napoli@giustiziacert.it" },
  { numero: 27, nome: "Seconda Cancelleria Civile (II, VI)", torre: "Torre A", piano: "27", responsabile: "Maria Teresa Rosa", telefono: "0812239983", email: "sez2.civile.ca.napoli@giustizia.it", pec: "sez2.civile.ca.napoli@giustiziacert.it" },
  { numero: 28, nome: "Terza Cancelleria Civile (III, VII)", torre: "Torre A", piano: "28", responsabile: "Pietra Della Gatta", telefono: "0812239948", email: "sez3.civile.ca.napoli@giustizia.it", pec: "sez3.civile.ca.napoli@giustiziacert.it" },
  { numero: 29, nome: "Coordinatore Spese di Giustizia", torre: "Torre A", piano: "29", responsabile: "Francesco Ciniglio", telefono: "0812239998" },
  { numero: 30, nome: "Funzionario Delegato Spese di Giustizia", torre: "Torre A", piano: "29", responsabile: "Ernesto Micillo", telefono: "0812239912", email: "delegatospesedigiustizia.ca.napoli@giustizia.it", pec: "funzionariodelegato.ca.napoli@giustiziacert.it" },
  { numero: 31, nome: "Ragioneria", torre: "Torre A", piano: "29", responsabile: "Eliana Fossataro", telefono: "0812239936", email: "cassa.ca.napoli@giustizia.it", pec: "ragioneria.ca.napoli@giustiziacert.it" },
  { numero: 32, nome: "Registro Spese Giustizia e Depositi", torre: "Torre A", piano: "29", responsabile: "Felice Castiglia", telefono: "0812233202", email: "ufficiospesegiustizia.ca.napoli@giustizia.it", pec: "speseanticipate.ca.napoli@giustiziacert.it" },
  { numero: 33, nome: "Ufficio Unico Liquidazioni", torre: "Torre A", piano: "29", responsabile: "Felice Castiglia", telefono: "0812233202", email: "ufficiounicoliquidazioni.ca.napoli@giustizia.it", pec: "liquidazioni.ca.napoli@giustiziacert.it" },
  { numero: 34, nome: "Cancelleria Sez. Lavoro, Previdenza e Assistenza", torre: "Torre B", piano: "6", responsabile: "Margherita Freda", telefono: "0812233272", email: "lavoro.ca.napoli@giustizia.it", pec: "lavoro.ca.napoli@giustiziacert.it" },
  { numero: 35, nome: "Archivio Generale Penale", torre: "Torre C", piano: "13", responsabile: "Marcella De Masi", telefono: "0812234056", email: "archiviopenale.ca.napoli@giustizia.it" },
  { numero: 36, nome: "Misure di Prevenzione", torre: "Torre C", piano: "13", responsabile: "Laura Ferrante", telefono: "0812234529", email: "sez8.penale.ca.napoli@giustizia.it", pec: "sez8.penale.ca.napoli@giustiziacert.it" },
  { numero: 37, nome: "Registro Generale Penale", torre: "Torre C", piano: "13", responsabile: "Lucia Piscitelli", telefono: "0812234497", email: "registrogenerale.ca.napoli@giustizia.it", pec: "registrogenerale.penale.ca.napoli@giustiziacert.it" },
  { numero: 38, nome: "Coordinatore Penale", torre: "Torre C", piano: "13", responsabile: "Lucia Piscitelli", telefono: "0812234497" },
  { numero: 39, nome: "Iscrizioni e Esecuzioni", torre: "Torre C", piano: "13", responsabile: "Rosa Fimiani", telefono: "0812234481", email: "iscrizione.ca.napoli@giustizia.it", pec: "esecuzionepenale.ca.napoli@giustiziacert.it" },
  { numero: 40, nome: "Ufficio Esecuzione Maxi Processi", torre: "Torre C", piano: "13", responsabile: "Giuseppe Toscano", telefono: "0812234493" },
  { numero: 41, nome: "Trattazione Procedure Incidentali", torre: "Torre C", piano: "13", responsabile: "Maddalena Merito", telefono: "0812234591", email: "esec.incesecuzione.ca.napoli@giustizia.it", pec: "incidentiesecuzioni.ca.napoli@giustiziacert.it" },
  { numero: 42, nome: "Recupero Crediti Penale", torre: "Torre C", piano: "2", telefono: "0812234467", email: "campione.ca.napoli@giustizia.it", pec: "recuperocrediti.ca.napoli@giustiziacert.it" },
  { numero: 43, nome: "Area Prima e Seconda Sezione Penale", torre: "Torre C", piano: "13", responsabile: "Livia Trapani", telefono: "0812234523", email: "sez1.penale.ca.napoli@giustizia.it", pec: "sez1.penale.ca.napoli@giustiziacert.it" },
  { numero: 44, nome: "Area Terza e Sesta Sezione Penale", torre: "Torre C", piano: "14", responsabile: "Luca Sarnelli", telefono: "0812234572", email: "sez3.penale.ca.napoli@giustizia.it", pec: "sez3.penale.ca.napoli@giustiziacert.it" },
  { numero: 45, nome: "Area Quarta e Quinta Sezione Penale", torre: "Torre C", piano: "15", responsabile: "Marilisa Del Core", telefono: "0812234551", email: "sez4.penale.ca.napoli@giustizia.it", pec: "sez4.penale.ca.napoli@giustiziacert.it" },
  { numero: 46, nome: "Corte Assise Appello", torre: "Torre C", piano: "17", responsabile: "Marcella De Masi", telefono: "0812234617", email: "assise.appello.ca.napoli@giustizia.it", pec: "assiseappello.ca.napoli@giustiziacert.it" },
  { numero: 47, nome: "Personale UNEP", torre: "Sotto Gradinate Entrata Porzio", piano: "Terra", responsabile: "Roberta Pumpo", telefono: "0812231025", email: "personaleunep.ca.napoli@giustizia.it", pec: "segreteriaunep.ca.napoli@giustiziacert.it" },
];

export const CORTE_APPELLO_NAPOLI: UfficioGiudiziarioConfig = {
  id: 'corte-appello-napoli',
  label: "Corte d'Appello di Napoli",
  shortLabel: "Corte d'Appello Napoli",
  sede: 'Piazza Porzio - Nuovo Palazzo di Giustizia, 80143 Napoli',
  telefono: '081 223 7111',
  email: 'ca.napoli@giustizia.it',
  pec: 'prot.ca.napoli@giustiziacert.it',
  magistrati: CA_MAG,
  magistratiAree: [
    { id: 'civile', label: 'Civile', sezioniInclude: ['Sez. Civile', 'Acque', 'Impresa', 'Agraria', 'Minorenni'] },
    { id: 'lavoro', label: 'Lavoro', sezioniPrefix: ['Sez. Lavoro'] },
    { id: 'penale', label: 'Penale', sezioniInclude: ['Sez. Penale', 'Assise', 'Prevenzione'] },
  ],
  uffici: CA_UFF,
  vertici: CA_VERTICI,
};

export const UFFICI: Record<string, UfficioGiudiziarioConfig> = {
  'tribunale-napoli': TRIBUNALE_NAPOLI,
  'corte-appello-napoli': CORTE_APPELLO_NAPOLI,
};
