"""
Estrae i dati dell'Excel ubicazione_uffici_penali_nuovo_palazzo_giustizia_napoli.xlsx
e genera src/config/uffici-penali-na.ts.

Uso: python scripts/genera_uffici_penali.py
"""
import re
import unicodedata
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parent
XLSX = WORKSPACE / "ubicazione_uffici_penali_nuovo_palazzo_giustizia_napoli.xlsx"
OUT = ROOT / "src" / "config" / "uffici-penali-na.ts"

# Mapping ente full name -> id breve
ENTE_ID = {
    "Tribunale di Napoli": "tribunale",
    "Corte d'Appello di Napoli": "corteAppello",
    "Tribunale di Sorveglianza di Napoli": "sorveglianza",
    "Procura della Repubblica presso il Tribunale di Napoli": "procura",
    "Procura Generale presso la Corte d'Appello di Napoli": "procuraGenerale",
}


def slug(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s


def ts_str(s):
    if s is None:
        return "undefined"
    s = str(s).strip()
    if not s:
        return "undefined"
    # Riparazioni encoding (1° -> 1°, modalità -> modalita', ecc.)
    s = s.replace("ï¿½", "")  # placeholder ?
    s = s.replace("modalit�", "modalita'")
    # Escape JS string
    s = s.replace("\\", "\\\\").replace("'", "\\'")
    return f"'{s}'"


def main():
    wb = openpyxl.load_workbook(str(XLSX), data_only=True)
    sh = wb["Matrice uffici penali"]

    rows = list(sh.iter_rows(values_only=True))
    headers = [str(h or "").strip() for h in rows[0]]
    # Headers attesi: Ente | Macro-area | Ufficio / Sezione | Sede | Torre/Corpo
    #                 Piano | Stanza/Quota | Ingresso | Email | PEC
    #                 Tel./Resp. | Note di verifica | Fonte | URL fonte

    items = []
    counters = {}  # per id univoco
    for r in rows[1:]:
        if not r or all(c is None for c in r):
            continue
        rec = dict(zip(headers, r))
        ente = (rec.get("Ente") or "").strip()
        if not ente:
            continue
        ente_id = ENTE_ID.get(ente, slug(ente))
        macro = (rec.get("Macro-area") or "").strip()
        ufficio = (rec.get("Ufficio / Sezione") or "").strip()
        # ID stabile: ente_id + slug(ufficio)
        base_id = f"{ente_id}-{slug(ufficio)}"
        n = counters.get(base_id, 0)
        counters[base_id] = n + 1
        item_id = base_id if n == 0 else f"{base_id}-{n+1}"
        items.append({
            "id": item_id,
            "ente": ente_id,
            "enteLabel": ente,
            "macroArea": macro,
            "ufficio": ufficio,
            "sede": (rec.get("Sede") or "").strip(),
            "torre": (rec.get("Torre/Corpo") or "").strip(),
            "piano": (rec.get("Piano") or "").strip(),
            "stanza": (rec.get("Stanza/Quota") or "").strip(),
            "ingresso": (rec.get("Ingresso") or "").strip(),
            "email": (rec.get("Email") or "").strip(),
            "pec": (rec.get("PEC") or "").strip(),
            "telResp": (rec.get("Tel./Resp.") or "").strip(),
            "note": (rec.get("Note di verifica") or "").strip(),
        })

    # Genera il TS
    lines = []
    lines.append("/**")
    lines.append(" * Dislocazione cancellerie e uffici del settore penale del Nuovo Palazzo")
    lines.append(" * di Giustizia di Napoli (Tribunale, Corte d'Appello, Tribunale di")
    lines.append(" * Sorveglianza, Procura della Repubblica, Procura Generale).")
    lines.append(" *")
    lines.append(" * Fonte: ricognizione del 03/05/2026 sui siti istituzionali ministeriali.")
    lines.append(" * Generato da scripts/genera_uffici_penali.py a partire dal file Excel")
    lines.append(" * ubicazione_uffici_penali_nuovo_palazzo_giustizia_napoli.xlsx.")
    lines.append(" */")
    lines.append("")
    lines.append("export type EntePenale =")
    lines.append("  | 'tribunale'")
    lines.append("  | 'corteAppello'")
    lines.append("  | 'sorveglianza'")
    lines.append("  | 'procura'")
    lines.append("  | 'procuraGenerale';")
    lines.append("")
    lines.append("export interface UfficioPenale {")
    lines.append("  id: string;")
    lines.append("  ente: EntePenale;")
    lines.append("  enteLabel: string;")
    lines.append("  /** Macro-area funzionale (GIP/GUP, Dibattimento, Riesame, ...) */")
    lines.append("  macroArea: string;")
    lines.append("  /** Denominazione completa dell'ufficio o della sezione */")
    lines.append("  ufficio: string;")
    lines.append("  sede: string;")
    lines.append("  torre?: string;")
    lines.append("  piano?: string;")
    lines.append("  stanza?: string;")
    lines.append("  ingresso?: string;")
    lines.append("  email?: string;")
    lines.append("  pec?: string;")
    lines.append("  /** Telefono e/o responsabile (campo libero della fonte) */")
    lines.append("  telResp?: string;")
    lines.append("  /** Note di verifica della fonte (discrasie, dati da confermare) */")
    lines.append("  note?: string;")
    lines.append("}")
    lines.append("")
    lines.append("export const ENTI_PENALI: { id: EntePenale; label: string; short: string }[] = [")
    lines.append("  { id: 'tribunale',       label: 'Tribunale di Napoli',                                          short: 'Tribunale' },")
    lines.append("  { id: 'corteAppello',    label: \"Corte d'Appello di Napoli\",                                  short: \"Corte d'Appello\" },")
    lines.append("  { id: 'sorveglianza',    label: 'Tribunale di Sorveglianza di Napoli',                          short: 'Sorveglianza' },")
    lines.append("  { id: 'procura',         label: 'Procura della Repubblica presso il Tribunale di Napoli',       short: 'Procura' },")
    lines.append("  { id: 'procuraGenerale', label: \"Procura Generale presso la Corte d'Appello di Napoli\",       short: 'Procura Generale' },")
    lines.append("];")
    lines.append("")
    lines.append(f"export const UFFICI_PENALI: UfficioPenale[] = [")

    for it in items:
        parts = [
            f"id: {ts_str(it['id'])}",
            f"ente: {ts_str(it['ente'])} as EntePenale",
            f"enteLabel: {ts_str(it['enteLabel'])}",
            f"macroArea: {ts_str(it['macroArea'])}",
            f"ufficio: {ts_str(it['ufficio'])}",
            f"sede: {ts_str(it['sede'])}",
        ]
        for k in ("torre", "piano", "stanza", "ingresso", "email", "pec", "telResp", "note"):
            v = it.get(k)
            if v:
                parts.append(f"{k}: {ts_str(v)}")
        body = ",\n    ".join(parts)
        lines.append(f"  {{\n    {body},\n  }},")

    lines.append("];")
    lines.append("")

    OUT.write_text("\n".join(lines), encoding="utf-8", newline="\n")
    print(f"Generato {OUT}: {len(items)} uffici")


if __name__ == "__main__":
    main()
