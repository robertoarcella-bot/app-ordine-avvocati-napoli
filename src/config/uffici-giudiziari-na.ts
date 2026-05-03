/**
 * Dati su uffici giudiziari di Napoli (Tribunale + Corte d'Appello).
 *
 * Estratti dai siti istituzionali:
 *  - Tribunale: https://tribunale-napoli.giustizia.it/it/uffici_e_cancellerie.page
 *  - CA Napoli: https://ca-napoli.giustizia.it/it/uff_e_cancel_cort_app.page
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
const tAdd = (sez: string, full: string, ruolo: string, tipo: Magistrato['tipo'] = 'Togato') => {
  const parts = full.trim().split(' ');
  const cognome = parts.length >= 2 ? parts[parts.length - 1] : full;
  const nome = parts.length >= 2 ? parts.slice(0, -1).join(' ') : '';
  T_MAG.push({ sezione: sez, nome, cognome, ruolo, tipo });
};

// Civili
let s = "Sez. 01 - Famiglia";
tAdd(s, "Raffaele Sdino", "Presidente di Sezione");
["Rossella Di Palo","Immacolata Cozzolino","Gabriella Ferrara","Viviana Criscuolo","Paolo Napolitano","Rosaria Gatti","Eva Scalfati","Nadia Zampogna","Giulia D'Alessandro","Ivana Sassi","Manuela Massimo Esposito","Alessio Marfe'"].forEach(n => tAdd(s, n, "Giudice"));
["Antonio La Marca","Ilaria Caserta","Fabrizio Savoja"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Sez. 02 - Civile";
["Giuseppe Fiengo","Maria Gabriella Frallicciardi","Roberta Guardasole","Monica Marrazzo","Diego Ragozini","Maria Tuccillo","Fabiana Ucchiello"].forEach(n => tAdd(s, n, "Giudice"));
tAdd(s, "Giovanni Tedesco", "Presidente Reggente del Tribunale");
["Aldo Aratro","Raffaella D'Angelo","Andrea Pianese","Vincenzo Scalzone"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Sez. 03 - Civile / Tribunale Imprese";
tAdd(s, "Leonardo Pica", "Presidente di Sezione");
["Mario Fucito","Valerio Colandrea","Arminio Salvatore Rabuano","Ulisse Forziati","Maria Carolina De Falco","Caterina Di Martino","Paolo Andrea Vassallo"].forEach(n => tAdd(s, n, "Giudice"));

s = "Sez. 04 - Civile";
tAdd(s, "Roberta Di Clemente", "Presidente di Sezione");
["Biancamaria Pisciotta","Pasquale Pirone","Manuela Robustella","Valentina Valletta","Benedetta Ferone","Ettore Pastore Alinante","Barbara Tango"].forEach(n => tAdd(s, n, "Giudice"));
["Stefania Aulicino","Antonio Carleo","Pasquale Cognetta","Emanuele Lombardi"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Sez. 05 - Esecuzioni Immobiliari";
tAdd(s, "Roberto Peluso", "Presidente di Sezione");
["Maria Luisa Buono","Mario Ciccarelli","Gabriele Montefusco","Elisa Asprone","Guglielmo Manera"].forEach(n => tAdd(s, n, "Giudice"));

s = "Sez. 06 - Civile";
tAdd(s, "Ciro Caccaviello", "Presidente di Sezione");
["Angela Arena","Valeria Conforti","Rosamaria Ragosta","Anna Maria Diana"].forEach(n => tAdd(s, n, "Giudice"));
["Michele D'Auria","Giovanni Giordano","Luigi Manzi","Rita Nissim","Annunziata Pesce"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Sez. 07 - Fallimentare";
tAdd(s, "Gianpiero Scoppa", "Presidente di Sezione");
["Edmondo Cacace","Francesco Paolo Feo","Marco Pugliese","Loredana Ferrara","Ilaria Grimaldi","Francesca Reale"].forEach(n => tAdd(s, n, "Giudice"));

s = "Sez. 08 - Civile";
tAdd(s, "Pietro Lupi", "Presidente di Sezione");
["Claudia Colicchio","Nicoletta Calise","Francesca Console","Fiammetta Lo Bianco","Fabio Lombardo","Roberta De Luca"].forEach(n => tAdd(s, n, "Giudice"));
["Giovanni D'Istria","Nicola Manganelli","Francesco Russo"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Sez. 09 - Civile";
tAdd(s, "Marcello Sinisi", "Presidente di Sezione");
["Rosa Romano Cesareo","Angelo Pizzi Felice","Enrico Ardituro","Vincenzo Trinchillo"].forEach(n => tAdd(s, n, "Giudice"));
["Pasquale Amendola","Maria Esposito"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Sez. 10 - Civile";
tAdd(s, "Francesco Pastore", "Presidente di Sezione");
["Marcello Amura","Nicola Mazzocca","Anna Maria Pezzullo","Renata Palmieri","Gian Piero Vitale"].forEach(n => tAdd(s, n, "Giudice"));
["Maria Corvino","Maria Esposito","Maria Rosaria Spina","Isabella Martuscelli"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Sez. 11 - Civile";
tAdd(s, "Giovanni Scotto di Carlo", "Presidente di Sezione");
["Carla Sorrentini","Flora Vollero","Fabio Perrella","Vincenzo Pappalardo"].forEach(n => tAdd(s, n, "Giudice"));
["Paolino Bonavita","Maria Archetta Cappiello","Claudio Marsala","Concetta Menale","Filippo Peluso","Angela Ronconi"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Sez. 12 - Civile";
tAdd(s, "Antonio Attanasio", "Presidente di Sezione");
["Mauro Impresa","Diana Rotondaro","Luigia Stravino","Barbara Gargia","Alessia Notaro","Carla Hubler"].forEach(n => tAdd(s, n, "Giudice"));
["Filomena Fiore","Raffaele Grimaldi","Paolo Madonna","Annalisa Speranza","Alfonso Tinto","Lucia Vietri"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Sez. 13 - Civile / Immigrazione";
tAdd(s, "Mario Suriano", "Presidente di Sezione");
["Marida Corso","Grazia Bisogni","Stefania Starace","Cristina Correale","Mario De Simone","Alessandra Aiello","Cristina Capone"].forEach(n => tAdd(s, n, "Giudice"));
["Ivana Capone","Antonietta De Simone"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Sez. 14 - Esecuzioni Mobiliari";
tAdd(s, "Francesco Abete", "Presidente di Sezione");
["Laura Martano","Manuela Granata","Federica D'Auria","Margherita Lojodice","Miriam Valenti"].forEach(n => tAdd(s, n, "Giudice"));
["Rosanna Acampora","Teresa Addeo","Angelina Affinito","Angelo Beatrice","Giulio Calogero","Alba Stefania Farina","Pasquale Fedele","Stefania Pisciotta","Fausta Sorrentino","Arianna Speranza"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

// Lavoro
s = "Sez. Lavoro - Prima";
tAdd(s, "Ciro Cardellicchio", "Presidente di Sezione");
["Giuseppe Gambardella","Maria Pia Mazzocca","Stefania Borrelli","Maria Gaia Majorano","Luigi Ruoppolo","Sergio Palmieri","Martina Brizzi","Paolo Scognamiglio","Roberto De Matteis","Simona D'Auria","Anna Maria Beneduce","Fabrizio Finamore"].forEach(n => tAdd(s, n, "Giudice"));
tAdd(s, "Pierfrancesco Peluso", "Giudice Onorario", "Onorario");

s = "Sez. Lavoro - Seconda";
tAdd(s, "Maria Gallo", "Presidente di Sezione");
["Maria Rosaria Lombardi","Maria Vittoria Ciaramella","Maria Rosaria Elmino","Francesco Armato","Giovanna Picciotti","Federico Bile","Maria Lucantonio","Maria Rosaria Palumbo","Manuela Fontana","Manuela Montuori","Marta Correggia","Matilde Dell'Erario"].forEach(n => tAdd(s, n, "Giudice"));
tAdd(s, "Adele Di Lorenzo", "Giudice Onorario", "Onorario");

s = "Sez. Lavoro - Terza";
tAdd(s, "Paolo Coppola", "Presidente di Sezione");
["Roberta Manzon","Elisa Tomassi","Amalia Urzini","Alessandra Santulli","Francesca Alfano","Clara Ruggiero","Gabriella Gagliardi","Monica Galante","Laura Liguori","Anna Maria Lazzara","Marco Ghionni Crivelli Visconti","Daniela Ammendola"].forEach(n => tAdd(s, n, "Giudice"));
tAdd(s, "Davide Mozzillo", "Giudice Onorario", "Onorario");

// Penali
s = "I Sez. Penale";
["Maria Armonia De Rosa","Antonia Napolitano Tafuri","Federico Somma","Eliana Franco","Maria Tartaglia Polcini"].forEach(n => tAdd(s, n, "Giudice"));
["Vincenzo Catalano","Anna Cristina Falciano","Immacolata Mammalella","Cristiana Sirabella","Cosimo Vastola"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "II Sez. Penale (Misure Prevenzione)";
tAdd(s, "Teresa Areniello", "Presidente di Sezione");
["Mariarosaria Orditura","Paola Faillace","Maria Vittoria Foschini","Luciano Di Transo","Giuliana Pollio","Lucia La Posta","Pietro Carola"].forEach(n => tAdd(s, n, "Giudice"));

s = "III Sez. Penale";
tAdd(s, "Monica Amirante", "Presidente di Sezione");
["Elvira Russo","Luana Romano","Alessandro Cananzi","Amelia Primavera","Paola Pasqualina Laviano","Rosario Canciello"].forEach(n => tAdd(s, n, "Giudice"));
["Sergio Meo","Elena Di Tommaso","Mattia Palumbo","Gennaro Zurolo"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "IV Sez. Penale";
tAdd(s, "Paola Piccirillo", "Presidente di Sezione");
["Giuliana Taglialatela","Ludovica Mancini","Linda D'Ancona","Sabrina Calabrese","Filippo Putaturo"].forEach(n => tAdd(s, n, "Giudice"));
["Raffaele Griffo","Maria Iorio","Domenico Mocerino"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "V Sez. Penale";
tAdd(s, "Mariaconcetta Sorrentino", "Presidente di Sezione");
["Alessandra Ferrigno","Laura De Stefano","Diletta Gobbo"].forEach(n => tAdd(s, n, "Giudice"));
["Adele Granata","Paola Guadagni","Marcello Marseglia","Pietro Rocco","Fulvio Russo"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "VI Sez. Penale";
tAdd(s, "Anna Laura Alfano", "Presidente di Sezione");
["Stefania Daniele","Carlo Bardari","Diana Bottillo","Maria Adele Scaramella"].forEach(n => tAdd(s, n, "Giudice"));
["Giovanni Di Cataldo","Orlando Paolella","Giovanna Carla Pasquale"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "VII Sez. Penale";
tAdd(s, "Marta Di Stefano", "Presidente di Sezione");
["Angelo Ambrosio","Concetta Cristiano"].forEach(n => tAdd(s, n, "Giudice"));
["Concetta Grella","Sandra Lotti","Caterina Muti","Angelo Nappo","Francesca Todisco","Pietro Vestri"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "VIII Sez. Penale (Riesame)";
tAdd(s, "Antonio Pepe", "Presidente di Sezione (F.F.)");
["Oriente Capozzi","Vito Maria Giorgio Purcaro","Alessandra Consiglio","Francesca Ferri","Enrico Campoli","Daniela Cortucci","Rosa De Ruggiero","Nicola Marrone"].forEach(n => tAdd(s, n, "Giudice"));

s = "IX Sez. Penale";
tAdd(s, "Vincenzo Caputo", "Presidente di Sezione");
["Eliana Albanese","Alba Ilaria Napolitano","Valentina Gallo","Simona Cangiano"].forEach(n => tAdd(s, n, "Giudice"));
["Corrado Cuccurullo","Gaia Concetta Del Duca","Bruno Joudioux","Patrizia Tesauro"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "X Sez. Penale (Riesame)";
tAdd(s, "Anna Elisa De Tollis", "Presidente di Sezione");
["Alessandra Cantone","Paola Lombardi","Roberta Attena","Alfonso Scermino","Raffaella De Majo","Marco Carbone","Anna Imparato","Dario Gallo","Luca Purcaro"].forEach(n => tAdd(s, n, "Giudice"));

s = "XI Sez. Penale";
tAdd(s, "Tommaso Miranda", "Presidente di Sezione");
["Alberto Vecchione","Rossella Tammaro","Roberta Zinno","Salvatore D'Ambrosio","Roberta Ianuario"].forEach(n => tAdd(s, n, "Giudice"));
["Francesco Cavallaro","Nicolina Gallo","Teresa Magnoni","Andrea Casella"].forEach(n => tAdd(s, n, "Giudice Onorario", "Onorario"));

s = "XII Sez. Penale (Riesame)";
tAdd(s, "Michele Mazzeo", "Presidente di Sezione");
["Paola Russo","Maria Gabriella Pepe","Angela Paolelli","Barbara Mendia","Marina Cimma","Emilia Di Palma","Giovanna Cervo","Giuseppe Sepe"].forEach(n => tAdd(s, n, "Giudice"));

s = "Corte di Assise";
["Maurizio Conte","Giovanna Napoletano"].forEach(n => tAdd(s, n, "Presidente di Sezione"));
["Paola Valeria Scandone","Marzia Castaldi"].forEach(n => tAdd(s, n, "Giudice"));
tAdd(s, "Laura De Stefano", "Giudice Supplente");

s = "Ufficio GIP/GUP";
tAdd(s, "Giulia Romanazzi", "Presidente Sezione GIP");
["Sabato Abagnale","Gabriella Ambrosino","Rosaria Maria Aufieri","Antonio Baldassarre","Chiara Bardi","Donatella Bove","Nicoletta Campanaro","Ambra Cerabona","Alessandra Cesare","Maria Laura Ciollaro","Federica Colucci","Linda Comella","Enrico Contieri","Raffaele Coppola","Giovanni De Angelis","Federica De Bellis","Lucia De Micco","Daniela De Nicola","Luca Della Ragione","Rosaria Dello Stritto","Marco Discepolo","Fabrizia Fiore","Marco Giordano","Valentina Giovanniello","Federica Girardi","Alessandra Grammatica","Francesco Guerra","Maria Gabriella Iagulli","Isabella Iaselli","Gabriella Logozzo","Emilio Minio","Fabio Provvisier","Leda Rossetti","Luca Rossetti","Ivana Salvatore","Antonino Santoro","Carla Sarno","Mariano Sorrentino","Alessia Stadio","Anna Tirone","Federica Villano","Giovanni Vinciguerra","Alessandra Zingales"].forEach(n => tAdd(s, n, "Giudice GIP/GUP"));

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
  { nome: "Ufficio del Personale", torre: "A", piano: "23", responsabile: "Aldo Oliva (Direttore)", email: "ufficiopersonale.tribunale.napoli@giustizia.it" },
  { nome: "Ufficio Recupero Crediti", torre: "A", piano: "6", responsabile: "Gemma Corazza (Funz. Contabile)", email: "recuperocrediti.tribunale.napoli@giustizia.it", pec: "recuperocrediti.tribunale.napoli@giustiziacert.it" },
  { nome: "Ufficio Spese Pagate dall'Erario", torre: "B", piano: "22", responsabile: "Assunta Buonanno (Direttore)", email: "ufficiopagamenti.tribunale.napoli@giustizia.it" },
  { nome: "Ufficio Economato, Consegnatario e Automezzi", torre: "C", piano: "1", responsabile: "Paola Ruocco; Antonio Alario (Direttori)", email: "economato.tribunale.napoli@giustizia.it", pec: "economato.tribunale.napoli@giustiziacert.it" },
  { nome: "Archivio Generale", torre: "B", piano: "1", responsabile: "Roberto Longobardi (Direttore)", email: "archiviocivile.tribunale.napoli@giustizia.it", pec: "cronologico.tribunale.napoli@giustiziacert.it" },
  { nome: "Ufficio Corpi di Reato", torre: "B", piano: "11", responsabile: "Maurizio Scudiero (Funz. Giudiziario)", email: "corpireato.tribunale.napoli@giustizia.it", pec: "corpireato.tribunale.napoli@giustiziacert.it" },
  { nome: "Centralino", torre: "Ingresso Via Grimaldi", piano: "Terra", telefono: "0812238111; 0812238804" },
];

const T_DISL: Dislocazione[] = [
  { ufficio: "Presidenza", torre: "A", piano: "23" },
  { ufficio: "Dirigenza Amministrativa", torre: "A", piano: "23" },
  { ufficio: "Ufficio Innovazione e Protocollo", torre: "A", piano: "23" },
  { ufficio: "Ufficio del Personale", torre: "A", piano: "23" },
  { ufficio: "Ufficio Trascrizioni", torre: "A", piano: "6" },
  { ufficio: "Settore Civile (sezioni civili, lavoro, famiglia, fallimentare, immigrazione)", torre: "A", piano: "6 - 22", note: "Distribuito su più piani" },
  { ufficio: "Archivio Generale", torre: "B", piano: "1" },
  { ufficio: "Ufficio Consulenti Tecnici", torre: "B", piano: "6" },
  { ufficio: "Ufficio Recupero Crediti", torre: "B", piano: "6" },
  { ufficio: "Sezione Centralizzata Riesame", torre: "B", piano: "5" },
  { ufficio: "Settore Penale - Unità GIP/GUP", torre: "B", piano: "12 - 16" },
  { ufficio: "Settore Penale - Sezioni penali", torre: "B", piano: "17 - 23" },
  { ufficio: "Corte d'Assise", torre: "B", piano: "19" },
  { ufficio: "Front Office Penale", torre: "Ingresso lato C.D.N.", piano: "Terra" },
  { ufficio: "Sezioni Riesame (8, 10, 12)", torre: "C", piano: "5" },
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
["Antonio Mungo","Francesco Gesue' Rizzi Ulmo","Angelo Del Franco","Erminia Catapano","Federica Salvatore"].forEach(n => cAdd(s, n, "Consigliere"));
["Pietro Ernesto De Felice","Luigi Vinci","Massimo Fontana"].forEach(n => cAdd(s, n, "Esperto Trib. Acque Pubbliche", "Esperto"));

s = "Quinta Sez. - Sez. Specializzata Impresa";
["Paolo Celentano","Giuseppa D'Inverno","Roberto Notaro","Caterina Di Martino"].forEach(n => cAdd(s, n, "Consigliere"));
cAdd(s, "Virgilio Dante Bernardi", "Consigliere", "Togato", "Applicazione fino al 30/06/2026");

s = "Seconda Sez. Civile";
cAdd(s, "Elvira Bellantoni", "Presidente Sezione");
["Maria Teresa Onorato","Paola Martorana","Maria Luisa Arienzo","Mariacristina Carpinelli"].forEach(n => cAdd(s, n, "Consigliere"));
["Daniela Gesmundo","Chiara Memoli","Cesare Visconti"].forEach(n => cAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Quarta Sez. Civile - Sez. Spec. Agraria";
cAdd(s, "Giuseppe De Tullio", "Presidente Sezione");
["Massimo Sensale","Giuseppe Gustavo Infantini","Luigi Mancini","Rosanna De Rosa","Francesca Sicilia"].forEach(n => cAdd(s, n, "Consigliere"));
cAdd(s, "Massimo Vincenzo Rizzi", "Giudice Onorario", "Onorario");

s = "Sesta Sez. Civile";
cAdd(s, "Assunta D'Amore", "Presidente Sezione");
["Ada Meterangelis","Fabio Magistro","Regina Marina Elefante","Giuseppe Vinciguerra"].forEach(n => cAdd(s, n, "Consigliere"));
cAdd(s, "Maria Tartaglia Polcini", "Consigliere", "Togato", "Applicazione fino al 30/06/2026");
cAdd(s, "Fabrizio Carmina", "Giudice Onorario", "Onorario");

s = "Terza Sez. Civile";
cAdd(s, "Giulio Cataldi", "Presidente Sezione");
["Maria Casaregola","Rosaria Morrone","Stefano Celentano","Pasquale Ucci","Maria Cristina Rizzi","Michele Caccese"].forEach(n => cAdd(s, n, "Consigliere"));
["Fernando Amoroso","Sandro De Paola","Massimo Torre"].forEach(n => cAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Settima Sez. Civile";
cAdd(s, "Aurelia D'Ambrosio", "Presidente Sezione");
["Michele Magliulo","Paolo Mariani","Paola Giglio Cobuzio","Lucia Minauro","Marielda Montefusco","Monica Cacace"].forEach(n => cAdd(s, n, "Consigliere"));
cAdd(s, "Alessia Limongelli", "Consigliere", "Togato", "Applicazione fino al 30/06/2026");
["Giovanni D'Erme","Marco Marinaro"].forEach(n => cAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Ottava Sez. Civile";
cAdd(s, "Alessandro Cocchiara", "Presidente Sezione");
["Alberto Canale","Maria Rosaria Pupo","Massimiliano Sacchi","Paola Mastroianni"].forEach(n => cAdd(s, n, "Consigliere"));
cAdd(s, "Gerardo Giuliano", "Consigliere", "Togato", "Applicazione fino al 30/06/2026");
cAdd(s, "Rita Anna De Falco", "Giudice Onorario", "Onorario");

s = "Nona Sez. Civile";
cAdd(s, "Eugenio Forgillo", "Presidente Sezione");
["Natalia Ceccarelli","Antonio Criscuolo Gaito","Nicoletta Celentano","Maria Di Lorenzo","Francesco Notaro"].forEach(n => cAdd(s, n, "Consigliere"));
["Flora De Caro","Sandro Figliozzi"].forEach(n => cAdd(s, n, "Giudice Onorario", "Onorario"));

s = "Sez. Minorenni, Persona e Famiglia";
["Efisia Gaviano","Marina Tafuri","Silvana Sica","Stefano Risolo","Ornella Minucci"].forEach(n => cAdd(s, n, "Consigliere"));
["Maria Concetta Miranda","Fara Vozza","Antonio Virgili","Rosanna Izzo","Renato Sampogna","Aniello De Vito","Riccardo Russo","Filomena Annigliato","Antonio Bonfitto"].forEach(n => cAdd(s, n, "Giudice Onorario Minorile", "Onorario"));

// Penali
s = "I Sez. Penale";
["Giovanni Carbone","Alberto Maria Picardi","Annamaria Casoria","Aldo Polizzi","Daniela Critelli","Mariarosaria Stanzione"].forEach(n => cAdd(s, n, "Consigliere"));

s = "II Sez. Penale";
cAdd(s, "Patrizia Cappiello", "Presidente Sezione");
["Francesco Valentini","Carmela Iorio","Gabriella Nuzzi","Fortunata Volpe","Maria Dolores Carapella","Dante Virgilio Bernardi","Giuseppe Orso"].forEach(n => cAdd(s, n, "Consigliere"));

s = "III Sez. Penale";
cAdd(s, "Loredana Di Girolamo", "Presidente Sezione");
["Elena Conte","Sandro Ciampaglia","Francesco De Falco Giannone","Giovanna Rosa Immacolata Di Petti","Saverio Vertuccio","Mario Roberto Gaudio","Gerardo Giuliano"].forEach(n => cAdd(s, n, "Consigliere"));

s = "IV Sez. Penale";
cAdd(s, "Francesco Ciocia", "Presidente Sezione");
["Luisa Toscano","Antonietta Golia","Elisabetta Catalanotti","Alessandra Maddalena","Federica De Maio","Nicola Russo","Diego Vargas","Francesca Spella"].forEach(n => cAdd(s, n, "Consigliere"));

s = "V Sez. Penale";
cAdd(s, "Mariella Montefusco", "Presidente Sezione");
["Andrea Rovida","Maria Delia Gaudino","Valeria Montesarchio","Francesco Caramico D'Auria","Cettina Scogliamiglio","Marcello De Chiara"].forEach(n => cAdd(s, n, "Consigliere"));

s = "VI Sez. Penale";
cAdd(s, "Antonella Terzi", "Presidente Sezione");
["Daria Vecchione","Roberta Troisi","Nicola Erminio Paone","Fabiana Mastrominico","Furio Cioffi","Gabriella Gallucci"].forEach(n => cAdd(s, n, "Consigliere"));

// Lavoro
s = "Sez. Lavoro - Prima Unità";
cAdd(s, "Mariavittoria Papa", "Presidente Sez. Lavoro");
["Giovanna Guarino","Nicoletta Giammarino","Chiara Di Benedetto","Francesca Gomez De Ayala"].forEach(n => cAdd(s, n, "Consigliere Sez. Lavoro"));
cAdd(s, "Carlo De Marchis", "Giudice Onorario", "Onorario");

s = "Sez. Lavoro - Seconda Unità";
cAdd(s, "Vincenza Totaro", "Presidente Sez. Lavoro");
["Sebastiano Napolitano","Rosa Del Prete","Arturo Avolio"].forEach(n => cAdd(s, n, "Consigliere Sez. Lavoro"));
cAdd(s, "Anselmo Del Fiacco", "Giudice Onorario", "Onorario");

s = "Sez. Lavoro - Terza Unità";
cAdd(s, "Piero Francesco De Pietro", "Presidente Sez. Lavoro");
["Antonietta Savino","Stefania Basso","Anna Rita Motti","Gabriella Gentile"].forEach(n => cAdd(s, n, "Consigliere Sez. Lavoro"));
cAdd(s, "Michela Bacchetti", "Giudice Onorario", "Onorario");

s = "Sez. Lavoro - Quarta Unità";
cAdd(s, "Gennaro Iacone", "Presidente Sez. Lavoro");
["Carmen Lombardi","Maria Chiodi","Milena Cortigiano","Luca Buccheri","Chiara De Franco"].forEach(n => cAdd(s, n, "Consigliere Sez. Lavoro"));

s = "Sez. Lavoro - Quinta Unità";
cAdd(s, "Anna Carla Catalano", "Presidente Sez. Lavoro");
["Rosa Bernardina Cristofano","Francesca Romana Amarelli","Laura Laureti","Laura Scarlatelli"].forEach(n => cAdd(s, n, "Consigliere Sez. Lavoro"));
cAdd(s, "Paolo Barletta", "Giudice Onorario", "Onorario");

const CA_VERTICI = [
  { nome: "Maria Rosaria", cognome: "Covelli", ruolo: "Presidente della Corte d'Appello" },
  { nome: "Eugenio", cognome: "Forgillo", ruolo: "Presidente Vicario", note: "Coordinatore Settore Civile" },
  { nome: "Mariella", cognome: "Montefusco", ruolo: "Coordinatore Settore Penale" },
  { nome: "Mariavittoria", cognome: "Papa", ruolo: "Coordinatore Settore Lavoro" },
  { nome: "Ginevra", cognome: "Abbamondi", ruolo: "Coordinatore Sezioni Assise Appello" },
  { nome: "Alessandra", cognome: "Maddalena", ruolo: "Coordinatore Ufficio Innovazione" },
];

const CA_UFF: UfficioInfo[] = [
  { numero: 1, nome: "Centralino", torre: "Torre C", piano: "1", telefono: "0812237111" },
  { numero: 2, nome: "Ufficio del Consegnatario", torre: "Lotto 1", piano: "1", responsabile: "Gennaro Auzino", telefono: "0812232065", email: "gennaro.auzino@giustizia.it" },
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
  { numero: 13, nome: "Personale Magistratura Ordinaria", torre: "Lotto 1", piano: "3", responsabile: "Matilde Scarpa", telefono: "0812232020", email: "pers.magistratura.ca.napoli@giustizia.it" },
  { numero: 14, nome: "Segreteria del Dirigente Amministrativo", torre: "Lotto 1", piano: "4", responsabile: "Ivonne De Luca", telefono: "0812233257", email: "segrsup.ca.napoli@giustizia.it", pec: "dirigente.ca.napoli@giustiziacert.it" },
  { numero: 15, nome: "Personale Amministrativo", torre: "Lotto 1", piano: "4", responsabile: "Maria Rosaria Castellano", telefono: "0812233258", email: "personale.ca.napoli@giustizia.it", pec: "personale.ca.napoli@giustiziacert.it" },
  { numero: 16, nome: "Biblioteca", torre: "Lotto 1", piano: "Terra", responsabile: "Gioacchino Angiolelli; Francesco Amodio", telefono: "0812232510", email: "biblioteca.ca.napoli@giustizia.it" },
  { numero: 17, nome: "Esami Avvocato", torre: "Lotto 1", piano: "Terra", responsabile: "Roberta Pumpo", telefono: "0812231025", email: "esamiavv.ca.napoli@giustizia.it", pec: "esamiavvocato.ca.napoli@giustiziacert.it" },
  { numero: 18, nome: "Trasmissione Atti in Cassazione", torre: "Torre A", piano: "1", responsabile: "Stefania De Falco Giannone", telefono: "0812238106", email: "ufficiocassazioneinvio.ca.napoli@giustizia.it" },
  { numero: 19, nome: "Trattazione Fascicoli da Cassazione", torre: "Torre A", piano: "1", responsabile: "Mario Paesano", telefono: "0812238078", email: "ufficiocassazioneritorno.ca.napoli@giustizia.it" },
  { numero: 20, nome: "Cancelleria Persona, Famiglia e Minori", torre: "Torre A", piano: "24", responsabile: "Caterina Mazzei", telefono: "0812239761", email: "sezpersonaefamiglia.ca.napoli@giustizia.it", pec: "famiglia.ca.napoli@giustiziacert.it" },
  { numero: 21, nome: "Ruolo Generale Civile - Repertorio - Archivio", torre: "Torre A", piano: "24", responsabile: "Antonio Rusciano", telefono: "0812239796", email: "settore.civile.ca.napoli@giustizia.it", pec: "ruologen.civile.ca.napoli@giustiziacert.it" },
  { numero: 22, nome: "Ufficio Elettorale", torre: "Torre A", piano: "24", responsabile: "Pasquale Corrado", telefono: "0812232019", email: "coordinamentoelettorale.ca.napoli@giustizia.it" },
  { numero: 23, nome: "Coordinatore Settore Civile", torre: "Torre A", piano: "24", responsabile: "Maria Iodice", telefono: "0812239787", email: "coordinamentocivile.ca.napoli@giustizia.it" },
  { numero: 24, nome: "Recupero Crediti Civile", torre: "Torre A", piano: "24", responsabile: "Giuseppina Simonetti", telefono: "0812239792", email: "recuperocrediticivile.ca.napoli@giustizia.it" },
  { numero: 25, nome: "Prima Cancelleria Civile (I, V, Acque, Impresa)", torre: "Torre A", piano: "25", responsabile: "Flaviana Margherita D'Amico", telefono: "0812239814", email: "sez1.civile.ca.napoli@giustizia.it" },
  { numero: 26, nome: "Quarta Cancelleria Civile (IV, VIII, IX, Agraria)", torre: "Torre A", piano: "26", responsabile: "Carmen Cucciniello", telefono: "0812239867", email: "sez4.civile.ca.napoli@giustizia.it" },
  { numero: 27, nome: "Seconda Cancelleria Civile (II, VI)", torre: "Torre A", piano: "27", responsabile: "Maria Teresa Rosa", telefono: "0812239983", email: "sez2.civile.ca.napoli@giustizia.it" },
  { numero: 28, nome: "Terza Cancelleria Civile (III, VII)", torre: "Torre A", piano: "28", responsabile: "Pietra Della Gatta", telefono: "0812239948", email: "sez3.civile.ca.napoli@giustizia.it" },
  { numero: 29, nome: "Coordinatore Spese di Giustizia", torre: "Torre A", piano: "29", responsabile: "Francesco Ciniglio", telefono: "0812239998" },
  { numero: 30, nome: "Funzionario Delegato Spese di Giustizia", torre: "Torre A", piano: "29", responsabile: "Ernesto Micillo", telefono: "0812239912", email: "delegatospesedigiustizia.ca.napoli@giustizia.it", pec: "funzionariodelegato.ca.napoli@giustiziacert.it" },
  { numero: 31, nome: "Ragioneria", torre: "Torre A", piano: "29", responsabile: "Eliana Fossataro", telefono: "0812239936", email: "cassa.ca.napoli@giustizia.it", pec: "ragioneria.ca.napoli@giustiziacert.it" },
  { numero: 32, nome: "Registro Spese Giustizia e Depositi", torre: "Torre A", piano: "29", responsabile: "Marina Monaco", telefono: "0812239962", email: "ufficiospesegiustizia.ca.napoli@giustizia.it" },
  { numero: 33, nome: "Ufficio Unico Liquidazioni", torre: "Torre A", piano: "29", responsabile: "Felice Castiglia", telefono: "0812233202", email: "ufficiounicoliquidazioni.ca.napoli@giustizia.it" },
  { numero: 34, nome: "Cancelleria Sez. Lavoro, Previdenza e Assistenza", torre: "Torre B", piano: "6", responsabile: "Margherita Freda", telefono: "0812233272", email: "lavoro.ca.napoli@giustizia.it", pec: "lavoro.ca.napoli@giustiziacert.it" },
  { numero: 35, nome: "Archivio Generale Penale", torre: "Torre C", piano: "13", responsabile: "Marcella De Masi", telefono: "0812234056", email: "archiviopenale.ca.napoli@giustizia.it" },
  { numero: 36, nome: "Misure di Prevenzione", torre: "Torre C", piano: "13", responsabile: "Laura Ferrante", telefono: "0812234529", email: "sez8.penale.ca.napoli@giustizia.it", pec: "sez8.penale.ca.napoli@giustiziacert.it" },
  { numero: 37, nome: "Registro Generale Penale", torre: "Torre C", piano: "13", responsabile: "Lucia Piscitelli", telefono: "0812234497", email: "registrogenerale.ca.napoli@giustizia.it" },
  { numero: 38, nome: "Coordinatore Penale", torre: "Torre C", piano: "13", responsabile: "Lucia Piscitelli", telefono: "0812234497" },
  { numero: 39, nome: "Iscrizioni e Esecuzioni", torre: "Torre C", piano: "13", responsabile: "Rosa Fimiani", telefono: "0812234481", email: "iscrizione.ca.napoli@giustizia.it", pec: "esecuzionepenale.ca.napoli@giustiziacert.it" },
  { numero: 40, nome: "Trattazione Procedure Incidentali", torre: "Torre C", piano: "13", responsabile: "Maddalena Merito", telefono: "0812234591", email: "esec.incesecuzione.ca.napoli@giustizia.it" },
  { numero: 41, nome: "Recupero Crediti Penale", torre: "Torre C", piano: "2", telefono: "0812234467", email: "campione.ca.napoli@giustizia.it" },
  { numero: 42, nome: "Area Prima e Seconda Sezione Penale", torre: "Torre C", piano: "13", responsabile: "Livia Trapani", telefono: "0812234523", email: "sez1.penale.ca.napoli@giustizia.it" },
  { numero: 43, nome: "Area Terza e Sesta Sezione Penale", torre: "Torre C", piano: "14", responsabile: "Luca Sarnelli", telefono: "0812234572", email: "sez3.penale.ca.napoli@giustizia.it" },
  { numero: 44, nome: "Area Quarta e Quinta Sezione Penale", torre: "Torre C", piano: "15", responsabile: "Marilisa Del Core", telefono: "0812234551", email: "sez4.penale.ca.napoli@giustizia.it" },
  { numero: 45, nome: "Corte Assise Appello", torre: "Torre C", piano: "17", responsabile: "Marcella De Masi", telefono: "0812234617", email: "assise.appello.ca.napoli@giustizia.it" },
  { numero: 46, nome: "Personale UNEP", torre: "Sotto Gradinate Entrata Porzio", piano: "Terra", responsabile: "Roberta Pumpo", telefono: "0812231025", email: "personaleunep.ca.napoli@giustizia.it" },
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
    { id: 'penale', label: 'Penale', sezioniInclude: ['Sez. Penale'] },
  ],
  uffici: CA_UFF,
  vertici: CA_VERTICI,
};

export const UFFICI: Record<string, UfficioGiudiziarioConfig> = {
  'tribunale-napoli': TRIBUNALE_NAPOLI,
  'corte-appello-napoli': CORTE_APPELLO_NAPOLI,
};
