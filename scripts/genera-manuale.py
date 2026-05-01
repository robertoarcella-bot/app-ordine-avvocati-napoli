"""
Genera il Manuale Utente dell'app Ordine Avvocati Napoli.

- Crea wireframe PNG simulati delle schermate principali con PIL
- Compone il documento .docx con python-docx
- Output: ../Manuale_App_OrdineAvvocatiNapoli.docx
"""
import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

from docx import Document
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_ALIGN_VERTICAL
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

# ============== Setup percorsi ==============
ROOT = Path(__file__).resolve().parents[1]               # app-coa/
WORKSPACE = ROOT.parent                                   # APP_COA/
IMAGES_DIR = ROOT / "scripts" / "manual-images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT = WORKSPACE / "Manuale_App_OrdineAvvocatiNapoli.docx"

# ============== Palette istituzionale ==============
PRIMARY = (0, 102, 204)        # #0066CC AgID
PRIMARY_DARK = (0, 63, 127)
SECONDARY = (201, 162, 74)      # oro
TERTIARY = (107, 30, 42)        # bordeaux
SUCCESS = (45, 211, 111)
BG = (248, 248, 248)
CARD = (255, 255, 255)
TEXT = (33, 37, 41)
MUTED = (110, 117, 130)
BORDER = (225, 230, 236)
SPLASH_BG = (253, 249, 245)


def _font(size, bold=False):
    """Best-effort: prova Segoe UI / Arial; fallback default."""
    candidates = [
        ("seguibl.ttf" if bold else "segoeui.ttf", "C:/Windows/Fonts/"),
        ("arialbd.ttf" if bold else "arial.ttf", "C:/Windows/Fonts/"),
    ]
    for name, base in candidates:
        try:
            return ImageFont.truetype(base + name, size)
        except OSError:
            continue
    try:
        return ImageFont.truetype("DejaVuSans" + ("-Bold" if bold else "") + ".ttf", size)
    except OSError:
        return ImageFont.load_default()


def _measure(draw, text, font):
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def _frame(width=540, height=960, status_dark=True):
    img = Image.new("RGB", (width, height), BG)
    draw = ImageDraw.Draw(img)
    # status bar finta
    if status_dark:
        draw.rectangle([0, 0, width, 22], fill=PRIMARY_DARK)
    return img, draw


def _toolbar(draw, width, title, has_menu=True, has_back=False):
    draw.rectangle([0, 22, width, 78], fill=PRIMARY)
    f = _font(18, bold=True)
    if has_menu:
        # 3 lineette
        for i, y in enumerate([42, 50, 58]):
            draw.line([(20, y), (44, y)], fill="white", width=3)
    elif has_back:
        # freccia
        draw.line([(28, 50), (40, 38)], fill="white", width=3)
        draw.line([(28, 50), (40, 62)], fill="white", width=3)
    draw.text((60 if (has_menu or has_back) else 20, 38), title, fill="white", font=f)


def _card(draw, x, y, w, h, fill=CARD, border=BORDER, radius=12):
    """rounded rect approssimato con rettangolo arrotondato."""
    draw.rounded_rectangle([x, y, x + w, y + h], radius=radius,
                           fill=fill, outline=border, width=1)


def _text(draw, x, y, txt, size=14, bold=False, color=TEXT):
    draw.text((x, y), txt, fill=color, font=_font(size, bold))


def _wrap(draw, x, y, txt, size, bold, color, max_w):
    """Divide il testo in linee in base alla larghezza."""
    f = _font(size, bold)
    words = txt.split(" ")
    line = ""
    cy = y
    for w in words:
        test = (line + " " + w).strip()
        tw, _ = _measure(draw, test, f)
        if tw <= max_w:
            line = test
        else:
            draw.text((x, cy), line, fill=color, font=f)
            cy += int(size * 1.25)
            line = w
    if line:
        draw.text((x, cy), line, fill=color, font=f)
        cy += int(size * 1.25)
    return cy


# ============== Wireframe singole schermate ==============

def make_splash():
    img = Image.new("RGB", (540, 960), SPLASH_BG)
    draw = ImageDraw.Draw(img)
    title = _font(40, bold=True)
    sub = _font(14, bold=False)
    color = (15, 32, 70)
    # "Ordine Avvocati"
    w1, h1 = _measure(draw, "Ordine Avvocati", title)
    draw.text(((540 - w1) // 2, 380), "Ordine Avvocati", fill=color, font=title)
    # "Napoli"
    w2, h2 = _measure(draw, "Napoli", title)
    draw.text(((540 - w2) // 2, 380 + h1 + 8), "Napoli", fill=color, font=title)
    # rombo divisorio
    cy = 380 + h1 + h2 + 30
    draw.line([(120, cy), (260, cy)], fill=color, width=1)
    draw.polygon([(270, cy - 6), (276, cy), (270, cy + 6), (264, cy)], fill=color)
    draw.line([(282, cy), (420, cy)], fill=color, width=1)
    # subtitle
    s = "App sviluppata da Avv. Roberto Arcella"
    w3, _ = _measure(draw, s, sub)
    draw.text(((540 - w3) // 2, cy + 20), s, fill=color, font=sub)
    return img


def make_home():
    img, draw = _frame()
    _toolbar(draw, 540, "Ordine Avvocati Napoli")
    # Logo + titolo
    _card(draw, 16, 90, 508, 90, fill=CARD)
    _text(draw, 30, 105, "🏛  Logo", size=18, bold=True, color=PRIMARY_DARK)
    _text(draw, 30, 138, "Consiglio dell'Ordine degli Avvocati di Napoli",
          size=11, bold=True, color=TEXT)

    tiles = [
        ("📰", "News", PRIMARY),
        ("🌐", "Sito", SECONDARY),
        ("📄", "Documenti", TERTIARY),
        ("🔧", "Strumenti", PRIMARY),
        ("🏛", "Aule Udienze", SECONDARY),
        ("⚖", "Processo Telematico", TERTIARY),
        ("🔒", "Area riservata", PRIMARY),
        ("👤", "Riconosco", SECONDARY),
    ]
    cell_w, cell_h = 240, 130
    margin_x, margin_y = 16, 200
    gap = 12
    for i, (icon, label, color) in enumerate(tiles):
        col = i % 2
        row = i // 2
        x = margin_x + col * (cell_w + gap)
        y = margin_y + row * (cell_h + gap)
        _card(draw, x, y, cell_w, cell_h)
        _text(draw, x + cell_w // 2 - 14, y + 22, icon, size=36, bold=False, color=color)
        # label centrata
        f = _font(13, bold=True)
        tw, _h = _measure(draw, label, f)
        draw.text((x + (cell_w - tw) // 2, y + cell_h - 36), label, fill=TEXT, font=f)
    return img


def make_menu():
    img, draw = _frame()
    _toolbar(draw, 540, "Menu")
    # Logo nel menu
    _card(draw, 0, 78, 540, 110, fill=CARD, border=CARD)
    _text(draw, 540 // 2 - 20, 100, "🏛", size=36, color=PRIMARY)
    _text(draw, 100, 145, "Consiglio dell'Ordine", size=11, bold=True, color=MUTED)
    _text(draw, 130, 162, "degli Avvocati di Napoli", size=11, bold=False, color=MUTED)

    items = [
        ("🏠", "Home"),
        ("👥", "Consiglio dell'Ordine"),
        ("📰", "News"),
        ("🌐", "Sito Ordine Avvocati"),
        ("📚", "Albo Avvocati"),
        ("📄", "Documenti"),
        ("🔧", "Strumenti"),
        ("🏛", "Aule Udienze Napoli"),
        ("⚖", "Processo Telematico"),
        ("🔒", "Area Riservata"),
        ("💡", "Commissione Informatica"),
        ("ℹ", "Info & Crediti"),
    ]
    y = 200
    for icon, label in items:
        _text(draw, 24, y, icon, size=18, color=PRIMARY)
        _text(draw, 60, y + 2, label, size=14, bold=False, color=TEXT)
        draw.line([(20, y + 30), (520, y + 30)], fill=BORDER, width=1)
        y += 44
    return img


def make_strumenti():
    img, draw = _frame()
    _toolbar(draw, 540, "Strumenti", has_back=True, has_menu=False)
    # Hint
    _text(draw, 16, 90, "☁ funziona offline    📶 serve internet",
          size=10, bold=False, color=MUTED)
    # Sezioni
    sections = [
        ("Servizi di interesse generale", [
            ("Parametri Forensi (D.M. 147/2022)", "☁"),
            ("Calcolo Fattura Avvocato", "☁"),
            ("Preventivo professionale", "☁"),
            ("Contributo Unificato (Civ/Trib/Amm)", "📶"),
            ("Interessi Legali e Moratori", "📶"),
        ]),
        ("Civile", [
            ("Termini c.p.c. (Cartabia)", "☁"),
            ("Termini Esecuzioni Civili", "☁"),
            ("Danno alla persona — TUN 2025", "☁"),
            ("FAQ Patrocinio Spese Stato (Civile)", "☁"),
        ]),
        ("Penale", [
            ("Calcolo Prescrizione Penale", "☁"),
            ("Patrocinio S.S. Penale (Napoli)", "☁"),
            ("PEC Uffici Giudiziari (PPT)", "☁"),
        ]),
    ]
    y = 120
    for title, items in sections:
        # divider
        draw.rectangle([0, y, 540, y + 28], fill=(244, 245, 248))
        _text(draw, 16, y + 7, title, size=12, bold=True, color=TEXT)
        y += 38
        for label, badge in items:
            _text(draw, 24, y + 6, "•", size=18, color=PRIMARY)
            _text(draw, 44, y + 8, label, size=12, color=TEXT)
            _text(draw, 480, y + 8, badge, size=14, color=SUCCESS if badge == "☁" else (255, 196, 9))
            y += 30
        y += 6
        if y > 920:
            break
    return img


def make_aule_lavoro():
    img, draw = _frame()
    _toolbar(draw, 540, "Aule Udienze Napoli", has_back=True, has_menu=False)
    _text(draw, 16, 92, "Calendario Udienze", size=18, bold=True, color=PRIMARY_DARK)
    _text(draw, 16, 118, "Sezione Lavoro — Tribunale di Napoli", size=10, color=MUTED)

    # search
    _card(draw, 16, 144, 508, 38, border=BORDER)
    _text(draw, 28, 156, "Cerca giudice…", size=12, color=MUTED)

    # day filters chips
    chips = [("Tutti", False), ("Lun", False), ("Mar", True),
             ("Mer", False), ("Gio", False), ("Ven", False)]
    cx = 16
    cy = 198
    for label, active in chips:
        cw = 56 if label != "Tutti" else 60
        if active:
            draw.rounded_rectangle([cx, cy, cx + cw, cy + 28], radius=14,
                                   fill=PRIMARY, outline=PRIMARY)
            _text(draw, cx + 12, cy + 6, label, size=11, bold=True, color=(255, 255, 255))
        else:
            draw.rounded_rectangle([cx, cy, cx + cw, cy + 28], radius=14,
                                   fill=(230, 240, 250), outline=(230, 240, 250))
            _text(draw, cx + 12, cy + 6, label, size=11, bold=True, color=PRIMARY_DARK)
        cx += cw + 6

    # judge cards
    judges = [
        ("ALFANO", "III", "10", ["Martedì", "Giovedì"]),
        ("ARMATO", "II", "9", ["Martedì", "Giovedì"]),
        ("BORRELLI", "I", "8", ["Martedì", "Giovedì"]),
        ("CARDELLICCHIO", "I", "7", ["Martedì", "Giovedì"]),
    ]
    cy = 248
    for name, sez, piano, days in judges:
        _card(draw, 16, cy, 508, 130)
        _text(draw, 28, cy + 12, name, size=15, bold=True, color=PRIMARY_DARK)
        draw.line([(28, cy + 38), (508, cy + 38)], fill=BORDER, width=1)
        # pill sezione (oro)
        draw.rounded_rectangle([28, cy + 50, 130, cy + 78], radius=8,
                               fill=SECONDARY, outline=SECONDARY)
        _text(draw, 38, cy + 56, "SEZIONE", size=8, bold=True, color=(74, 58, 20))
        _text(draw, 100, cy + 54, sez, size=14, bold=True, color=(0, 0, 0))
        # pill piano
        draw.rounded_rectangle([140, cy + 50, 240, cy + 78], radius=8,
                               fill=(238, 244, 251), outline=(180, 210, 240))
        _text(draw, 152, cy + 56, "PIANO", size=8, bold=True, color=MUTED)
        _text(draw, 200, cy + 54, piano, size=14, bold=True, color=PRIMARY_DARK)
        # giorni
        _text(draw, 28, cy + 86, "GIORNI DI UDIENZA", size=9, bold=True, color=MUTED)
        dx = 28
        for d in days:
            _text(draw, dx, cy + 102, d, size=11, bold=True, color=PRIMARY_DARK)
            dx += 80
        cy += 138
        if cy > 880:
            break
    return img


def make_processo_telematico():
    img, draw = _frame()
    _toolbar(draw, 540, "Processo Telematico", has_back=True, has_menu=False)
    _wrap(draw, 16, 90, "Notizie e avvisi ufficiali sui processi telematici, "
          "raggruppati per area di competenza.", 11, False, MUTED, 508)

    # Fonti news
    draw.rectangle([0, 138, 540, 168], fill=(244, 245, 248))
    _text(draw, 16, 145, "Fonti di news ufficiali", size=12, bold=True, color=TEXT)

    sources = [
        ("🛡", "PST — Min. Giustizia",
         "Avvisi ufficiali su PCT, PPT, malfunzionamenti…"),
        ("🏢", "Giustizia Amministrativa",
         "Pronunce del Consiglio di Stato e dei TAR"),
        ("💼", "Giustizia Tributaria",
         "Avvisi e rassegne sentenze (RSS ufficiale)"),
    ]
    y = 178
    for icon, title, desc in sources:
        _text(draw, 24, y + 12, icon, size=22, color=PRIMARY)
        _text(draw, 60, y + 8, title, size=12, bold=True, color=TEXT)
        _text(draw, 60, y + 28, desc, size=10, color=MUTED)
        draw.line([(0, y + 56), (540, y + 56)], fill=BORDER)
        y += 64

    # Strumenti operativi
    draw.rectangle([0, y, 540, y + 30], fill=(244, 245, 248))
    _text(draw, 16, y + 7, "Strumenti operativi", size=12, bold=True, color=TEXT)
    y += 40
    tools = [
        ("💼", "Depositi CCII (Crisi d'impresa)"),
        ("🧬", "Mappa XSD Depositi PCT"),
        ("🏢", "SIGP — Consultazione Giudice di Pace"),
    ]
    for icon, name in tools:
        _text(draw, 24, y + 6, icon, size=20, color=PRIMARY)
        _text(draw, 60, y + 8, name, size=12, color=TEXT)
        draw.line([(0, y + 36), (540, y + 36)], fill=BORDER)
        y += 44
    return img


def make_area_riservata():
    img, draw = _frame()
    _toolbar(draw, 540, "Area Riservata", has_back=True, has_menu=False)
    # card principale
    _card(draw, 16, 100, 508, 380)
    _text(draw, 30, 116, "🔒 Accesso al sito ufficiale", size=15, bold=True, color=PRIMARY_DARK)
    _wrap(draw, 30, 154,
          "L'area riservata viene aperta nel browser di sistema, dove "
          "potrai effettuare il login con le credenziali del sito "
          "istituzionale del Consiglio.",
          11, False, TEXT, 480)
    _wrap(draw, 30, 256,
          "Il browser di sistema mantiene la sessione tra aperture e "
          "supporta i password manager del telefono.",
          10, False, MUTED, 480)
    # bottone primary
    draw.rounded_rectangle([30, 340, 510, 380], radius=8, fill=PRIMARY)
    _text(draw, 100, 352, "🔑 Apri area riservata nel browser  ⤴",
          size=12, bold=True, color=(255, 255, 255))
    # security note
    _wrap(draw, 30, 400,
          "🛡 Le credenziali vengono inserite direttamente sul sito ufficiale "
          "del COA: l'app non le vede e non le memorizza.",
          10, False, MUTED, 480)
    return img


# ============== Genera tutte le immagini ==============
def generate_images():
    images = {
        "splash": make_splash(),
        "home": make_home(),
        "menu": make_menu(),
        "strumenti": make_strumenti(),
        "aule": make_aule_lavoro(),
        "pct": make_processo_telematico(),
        "area_riservata": make_area_riservata(),
    }
    paths = {}
    for k, img in images.items():
        p = IMAGES_DIR / f"{k}.png"
        img.save(p, format="PNG")
        paths[k] = p
        print(f"  [OK] {p.name}")
    return paths


# ============== Manuale ==============

def add_heading(doc, text, level=1):
    h = doc.add_heading(text, level=level)
    for run in h.runs:
        run.font.color.rgb = RGBColor(*PRIMARY_DARK)
    return h


def add_para(doc, text, bold=False, italic=False, size=11, color=None):
    p = doc.add_paragraph()
    r = p.add_run(text)
    r.bold = bold
    r.italic = italic
    r.font.size = Pt(size)
    if color:
        r.font.color.rgb = RGBColor(*color)
    return p


def add_bullet(doc, text):
    p = doc.add_paragraph(text, style="List Bullet")
    return p


def add_image(doc, path, width_cm=10, caption=None):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run()
    r.add_picture(str(path), width=Cm(width_cm))
    if caption:
        cap = doc.add_paragraph()
        cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cr = cap.add_run(caption)
        cr.italic = True
        cr.font.size = Pt(9)
        cr.font.color.rgb = RGBColor(*MUTED)


def build_manuale(images):
    doc = Document()

    # Stili globali base
    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Calibri"
    normal.font.size = Pt(11)

    # === FRONTESPIZIO ===
    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = title.add_run("Manuale d'uso")
    r.font.size = Pt(28)
    r.bold = True
    r.font.color.rgb = RGBColor(*PRIMARY_DARK)

    sub = doc.add_paragraph()
    sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = sub.add_run("App Ordine Avvocati Napoli")
    r.font.size = Pt(20)
    r.font.color.rgb = RGBColor(*PRIMARY)

    sub2 = doc.add_paragraph()
    sub2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = sub2.add_run("Consiglio dell'Ordine degli Avvocati di Napoli")
    r.italic = True
    r.font.size = Pt(13)

    doc.add_paragraph()
    add_image(doc, images["splash"], width_cm=8,
              caption="Schermata di apertura dell'app")
    doc.add_paragraph()

    credit = doc.add_paragraph()
    credit.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = credit.add_run("Autore: Avv. Roberto Arcella")
    r.bold = True
    r.font.size = Pt(11)
    credit2 = doc.add_paragraph()
    credit2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = credit2.add_run("Idea e collaborazione: Commissione Informatica del COA Napoli")
    r.font.size = Pt(10)
    r.font.color.rgb = RGBColor(*MUTED)

    doc.add_page_break()

    # === SOMMARIO ===
    add_heading(doc, "Sommario", level=1)
    sezioni = [
        "1. Introduzione",
        "2. Installazione",
        "3. Schermata principale (Home)",
        "4. Menu di navigazione",
        "5. Consiglio dell'Ordine",
        "6. News",
        "7. Sito Ordine Avvocati",
        "8. Albo Avvocati",
        "9. Documenti",
        "10. Strumenti",
        "11. Aule Udienze Napoli",
        "12. Processo Telematico",
        "13. Area Riservata",
        "14. Riconosco",
        "15. Commissione Informatica",
        "16. Info & Crediti",
        "17. Funzionalità trasversali",
        "18. Privacy e sicurezza",
        "19. Risoluzione problemi",
    ]
    for s in sezioni:
        doc.add_paragraph(s, style="List Number")

    doc.add_page_break()

    # === 1. INTRODUZIONE ===
    add_heading(doc, "1. Introduzione", level=1)
    add_para(doc,
             "L'app Ordine Avvocati Napoli è uno strumento informativo e operativo "
             "realizzato per gli iscritti al Consiglio dell'Ordine degli Avvocati di Napoli. "
             "Concentra in un unico punto le funzioni più frequentemente utili al "
             "professionista forense: news del Consiglio, accesso rapido al sito "
             "istituzionale, modulistica, calcolatori e strumenti operativi, "
             "informazioni sui processi telematici (PCT, PPT, processo amministrativo "
             "e tributario) e accesso all'area riservata.")
    add_para(doc,
             "L'app è stata sviluppata dall'Avv. Roberto Arcella su idea e con la "
             "collaborazione della Commissione Informatica del Consiglio dell'Ordine "
             "degli Avvocati di Napoli.")

    add_heading(doc, "Caratteristiche principali", level=2)
    for p in [
        "Funziona prevalentemente offline: i calcolatori e gli strumenti sono "
        "incorporati nel pacchetto e non richiedono connessione.",
        "News in tempo reale dal sito ufficiale del Consiglio, con cache locale "
        "(continuano a essere consultabili anche offline le ultime già lette).",
        "Aggregatore di notizie sui processi telematici da fonti istituzionali: "
        "Ministero della Giustizia (PST), Giustizia Amministrativa, Dipartimento "
        "della Giustizia Tributaria.",
        "Accesso integrato all'area riservata del sito tramite il browser interno "
        "dell'app, con le credenziali del Consiglio.",
        "Tema istituzionale conforme alle linee guida AgID per i siti della "
        "Pubblica Amministrazione italiana.",
        "Supporto del tema scuro automatico in base alle preferenze del telefono.",
    ]:
        add_bullet(doc, p)

    doc.add_page_break()

    # === 2. INSTALLAZIONE ===
    add_heading(doc, "2. Installazione", level=1)
    add_para(doc,
             "Nella prima fase l'app viene distribuita come file APK Android, "
             "da installare manualmente. Il file installer si chiama "
             "OrdineAvvocatiNapoli-debug.apk.")
    add_heading(doc, "Procedura su Android", level=2)
    for p in [
        "Trasferire l'APK sul telefono (e-mail, Google Drive, USB, link diretto).",
        "Aprire il file. Android chiederà di abilitare l'installazione da fonti "
        "sconosciute per il browser o file manager: confermare.",
        "Avviare l'installazione. L'app appare come Ordine Avvocati Napoli con "
        "icona blu istituzionale.",
        "Al primo avvio compare lo splash screen istituzionale, poi la schermata "
        "principale.",
    ]:
        add_bullet(doc, p)
    add_para(doc,
             "All'avvio non sono richieste registrazioni: l'app è subito utilizzabile "
             "in tutta la parte ad accesso libero. L'area riservata richiede le "
             "credenziali del sito istituzionale del Consiglio.",
             italic=True, color=MUTED)

    doc.add_page_break()

    # === 3. HOME ===
    add_heading(doc, "3. Schermata principale (Home)", level=1)
    add_para(doc,
             "La home presenta in alto il logo del Consiglio e la denominazione "
             "completa, e a seguire una griglia di otto riquadri rapidi che danno "
             "accesso alle aree principali dell'app:")
    add_image(doc, images["home"], width_cm=8,
              caption="Home — griglia 2×4 di accesso rapido")

    add_heading(doc, "Riquadri disponibili", level=2)
    tiles = [
        ("News", "Ultime news del Consiglio dell'Ordine"),
        ("Sito", "Sezioni del sito istituzionale (in WebView interna)"),
        ("Documenti", "Modulistica, Albo, Trasparenza, Verbali"),
        ("Strumenti", "Oltre 20 calcolatori e strumenti professionali"),
        ("Aule Udienze", "Sezione Lavoro, Aule Penali, Calendario GdP"),
        ("Processo Telematico", "Notizie da PST, GA, Giustizia Tributaria"),
        ("Area Riservata", "Accesso area riservata del sito (consiglieri)"),
        ("Riconosco", "Sistema di identità digitale dei consigli forensi"),
    ]
    for name, desc in tiles:
        p = doc.add_paragraph(style="List Bullet")
        r = p.add_run(name)
        r.bold = True
        p.add_run(f" — {desc}")

    add_para(doc,
             "Sotto la griglia sono mostrate, in formato sintetico, le ultime tre "
             "news pubblicate dal Consiglio. Tirando verso il basso (gesto di "
             "pull-to-refresh) le news vengono aggiornate.",
             color=MUTED)

    doc.add_page_break()

    # === 4. MENU ===
    add_heading(doc, "4. Menu di navigazione", level=1)
    add_para(doc,
             "Toccando l'icona ☰ in alto a sinistra (o scorrendo dal bordo "
             "sinistro dello schermo) si apre il menu laterale con tutte le "
             "voci di navigazione dell'app, in ordine logico di consultazione.")
    add_image(doc, images["menu"], width_cm=8,
              caption="Menu laterale (hamburger)")

    add_heading(doc, "Voci del menu", level=2)
    for v in [
        "Home — Torna alla schermata principale.",
        "Consiglio dell'Ordine — Composizione del Consiglio in carica.",
        "News — Tutte le news del Consiglio con ricerca e infinite scroll.",
        "Sito Ordine Avvocati — Indice delle sezioni del sito istituzionale.",
        "Albo Avvocati — Apre l'albo iscritti direttamente nel browser interno.",
        "Documenti — Modulistica e documenti pubblici di rilievo.",
        "Strumenti — Calcolatori e strumenti operativi.",
        "Aule Udienze Napoli — Calendario udienze e dislocazione aule.",
        "Processo Telematico — Notizie e strumenti per i processi telematici.",
        "Area Riservata — Accesso area riservata consiglieri.",
        "Commissione Informatica — Componenti della Commissione che ha "
        "ideato l'app.",
        "Info & Crediti — Contatti del Consiglio (offline) e crediti dell'app.",
    ]:
        add_bullet(doc, v)

    doc.add_page_break()

    # === 5. CONSIGLIO ===
    add_heading(doc, "5. Consiglio dell'Ordine", level=1)
    add_para(doc,
             "Mostra la composizione completa del Consiglio dell'Ordine in "
             "carica, suddivisa in due sezioni:")
    add_bullet(doc, "Ufficio di Presidenza (Presidente, Segretario, Tesoriera, "
               "Vice Presidenti)")
    add_bullet(doc, "Consiglieri (in ordine di pubblicazione sul sito)")
    add_para(doc,
             "Per ciascun componente è indicato il nome con il prefisso Avv. "
             "e, sotto, la carica ricoperta. Una piccola icona evidenzia "
             "l'appartenenza all'Ufficio di Presidenza.")

    # === 6. NEWS ===
    add_heading(doc, "6. News", level=1)
    add_para(doc,
             "Aggregatore delle news pubblicate sul sito istituzionale del "
             "Consiglio. Le news sono recuperate tramite l'API REST ufficiale "
             "di WordPress del sito (no scraping), con cache locale di 30 minuti "
             "per ridurre il consumo di dati.")
    add_heading(doc, "Funzioni", level=2)
    for f in [
        "Ricerca testuale all'interno delle news (campo cerca in alto).",
        "Pull-to-refresh per forzare il ricaricamento.",
        "Scroll infinito: scorrendo in basso vengono caricate le news più datate.",
        "Tocco su una news per leggere il contenuto completo.",
        "Pulsante condividi per inviare la news via WhatsApp, e-mail o altre app.",
        "Pulsante \"Apri sul sito\" per visualizzare la news direttamente sul "
        "sito istituzionale (dentro l'app o in browser esterno).",
    ]:
        add_bullet(doc, f)

    doc.add_page_break()

    # === 7. SITO ===
    add_heading(doc, "7. Sito Ordine Avvocati", level=1)
    add_para(doc,
             "Indice delle sezioni del sito istituzionale rese accessibili "
             "direttamente dall'app, ciascuna in WebView interna ottimizzata "
             "per dispositivi mobili.")
    add_heading(doc, "Sezioni disponibili", level=2)
    for s in [
        "Componenti C.O.A.",
        "Commissioni",
        "Verbali sedute consiliari",
        "Modulistica",
        "Amministrazione Trasparente",
        "Protocolli d'intesa",
        "Compiti e regolamenti",
        "Deposito negoziazioni assistite (sito esterno)",
        "Contatti",
    ]:
        add_bullet(doc, s)

    # === 8. ALBO ===
    add_heading(doc, "8. Albo Avvocati", level=1)
    add_para(doc,
             "Voce di menu autonoma che apre direttamente la sezione Albo ed "
             "Elenchi del sito ufficiale (avvocati, praticanti, elenchi "
             "specialistici) all'interno del browser dell'app.")

    # === 9. DOCUMENTI ===
    add_heading(doc, "9. Documenti", level=1)
    add_para(doc,
             "Catalogo dei documenti pubblici di rilievo del Consiglio, con "
             "accesso in un solo tocco a:")
    for s in [
        "Modulistica Ordine Professionale",
        "Albo ed Elenchi",
        "Compiti e regolamenti del Consiglio",
        "Verbali delle sedute consiliari",
        "Amministrazione Trasparente",
    ]:
        add_bullet(doc, s)

    doc.add_page_break()

    # === 10. STRUMENTI ===
    add_heading(doc, "10. Strumenti", level=1)
    add_para(doc,
             "Catalogo di calcolatori e strumenti professionali, raggruppati "
             "per area di competenza, in totale circa 22 strumenti tutti "
             "incorporati nell'app. Una piccola icona accanto al titolo "
             "indica se lo strumento funziona offline (☁) o richiede "
             "internet (📶).")
    add_image(doc, images["strumenti"], width_cm=8,
              caption="Strumenti — raggruppamento per giurisdizione")

    add_heading(doc, "Servizi di interesse generale", level=2)
    for s in [
        "Parametri Forensi (D.M. 147/2022) — calcolatore parcelle",
        "Calcolo Fattura Avvocato (CPA, IVA, ritenuta)",
        "Preventivo professionale",
        "Contributo Unificato (Civile/Tributario/Amministrativo)",
        "Interessi Legali e Moratori (tasso legale, BCE)",
        "Procura alle liti — generatore",
        "Anonimizzatore atti e provvedimenti",
        "Markdown → PDF Converter",
        "InvoicyLex — Dashboard Fiscale",
    ]:
        add_bullet(doc, s)
    add_heading(doc, "Civile", level=2)
    for s in [
        "Termini c.p.c. (Cartabia) — calcolatore termini processuali",
        "Termini Esecuzioni Civili",
        "Danno alla Persona — TUN 2025 (D.P.R. 12/2025)",
        "Danno Micropermanenti (metodo coefficienti)",
        "Contributo Unificato Famiglia",
        "Piano Genitoriale — redazione assistita",
        "FAQ Patrocinio Spese Stato (Civile)",
        "Analizzatore atti D.M. 110/2023",
        "Analisi Verbale Ricerca Beni",
    ]:
        add_bullet(doc, s)
    add_heading(doc, "Penale", level=2)
    for s in [
        "Calcolo Prescrizione Penale (avanzato)",
        "Patrocinio S.S. Penale — Protocollo Napoli",
        "PEC Uffici Giudiziari (PPT)",
    ]:
        add_bullet(doc, s)
    add_para(doc,
             "Tutti gli strumenti tradizionalmente pubblicati su "
             "avvocatotelematico.studiolegalearcella.it sono inclusi nel pacchetto "
             "dell'app a beneficio degli iscritti.",
             italic=True, color=MUTED)

    doc.add_page_break()

    # === 11. AULE ===
    add_heading(doc, "11. Aule Udienze Napoli", level=1)
    add_para(doc,
             "Strumenti dedicati alla logistica delle udienze presso il Tribunale "
             "di Napoli e gli uffici dei giudici di pace.")
    add_image(doc, images["aule"], width_cm=8,
              caption="Aule Sezione Lavoro — vista a card")

    add_heading(doc, "Aule Sezione Lavoro Napoli", level=2)
    add_para(doc,
             "Mostra il calendario delle udienze dei giudici della Sezione Lavoro "
             "in formato a card responsive (1, 2 o 3 colonne in base alla larghezza "
             "del dispositivo). Per ciascun giudice sono visibili in modo evidente:")
    add_bullet(doc, "Cognome del giudice in evidenza")
    add_bullet(doc, "Sezione (I, II o III) in pillola dorata")
    add_bullet(doc, "Piano dell'aula in pillola azzurra")
    add_bullet(doc, "Giorni di udienza")
    add_para(doc,
             "Sono presenti tre filtri: ricerca per cognome (con "
             "autocompletamento), filtro per giorno della settimana e filtro per "
             "sezione. All'apertura, l'app preseleziona automaticamente il giorno "
             "corrente, mostrando subito i giudici in udienza oggi.")

    add_heading(doc, "Aule Penali Napoli", level=2)
    add_para(doc,
             "Apre il canale Telegram @AulePenaliNapoli, con segnalazioni in "
             "tempo reale sulle aule penali. Richiede l'app Telegram installata.")

    add_heading(doc, "Calendario GdP Napoli 2026", level=2)
    add_para(doc,
             "Calendario delle udienze del Giudice di Pace di Napoli per "
             "l'anno corrente, completamente offline.")

    doc.add_page_break()

    # === 12. PCT ===
    add_heading(doc, "12. Processo Telematico", level=1)
    add_para(doc,
             "Aggregatore di notizie istituzionali e strumenti operativi sui "
             "processi telematici (civile, penale, amministrativo, tributario).")
    add_image(doc, images["pct"], width_cm=8,
              caption="Processo Telematico — fonti e strumenti")

    add_heading(doc, "Fonti di news ufficiali", level=2)
    for s in [
        "PST — Min. Giustizia: avvisi su PCT, PPT, malfunzionamenti dei sistemi.",
        "Giustizia Amministrativa: news del Consiglio di Stato e dei TAR (in WebView).",
        "Giustizia Tributaria (DGT MEF): feed RSS ufficiale con avvisi e rassegne.",
    ]:
        add_bullet(doc, s)

    add_heading(doc, "Strumenti operativi", level=2)
    for s in [
        "Depositi CCII — selettore atto-ruolo per il Codice della Crisi.",
        "Mappa XSD Depositi PCT — schemi SICID/SIECIC + CCII.",
        "SIGP — Consultazione Giudice di Pace (apre nel browser di sistema).",
    ]:
        add_bullet(doc, s)

    doc.add_page_break()

    # === 13. AREA RISERVATA ===
    add_heading(doc, "13. Area Riservata", level=1)
    add_para(doc,
             "Accesso all'area riservata del sito istituzionale, riservata ai "
             "consiglieri e ai professionisti che vi sono abilitati.")
    add_image(doc, images["area_riservata"], width_cm=8,
              caption="Area Riservata — accesso al sito istituzionale")
    add_para(doc,
             "Toccando il pulsante Apri area riservata nel browser, l'app lancia "
             "il browser di sistema (Chrome Custom Tabs su Android) sulla pagina di "
             "login del sito istituzionale del Consiglio. L'utente compila il modulo "
             "di login con le proprie credenziali ed entra in area riservata "
             "esattamente come da browser.")
    add_para(doc,
             "Vantaggi di questo approccio:")
    add_bullet(doc, "Sessione persistente tra aperture diverse (la sessione resta "
               "salvata nel browser di sistema).")
    add_bullet(doc, "Compatibilità con i password manager del telefono "
               "(autocompletamento delle credenziali).")
    add_bullet(doc, "Massima compatibilità con tutte le funzionalità del sito "
               "(redirect, banner, allegati).")
    add_para(doc,
             "L'app non vede e non memorizza username e password: il login è gestito "
             "interamente dal sito istituzionale dentro il browser di sistema.",
             bold=True)

    # === 14. RICONOSCO ===
    add_heading(doc, "14. Riconosco", level=1)
    add_para(doc,
             "Apre il portale Riconosco (riconosco.dcssrl.it), il sistema di "
             "identità digitale degli iscritti agli ordini forensi italiani, in "
             "Chrome Custom Tabs di sistema (per garantire il corretto "
             "funzionamento del banner privacy e della sessione).")

    # === 15. COMMISSIONE ===
    add_heading(doc, "15. Commissione Informatica", level=1)
    add_para(doc,
             "Pagina dedicata ai componenti della Commissione Informatica del "
             "Consiglio dell'Ordine degli Avvocati di Napoli, ideatrice e "
             "collaboratrice del progetto. Sono indicati:")
    add_bullet(doc, "Delegato all'informatica e all'innovazione")
    add_bullet(doc, "Coordinatore della Commissione")
    add_bullet(doc, "Componenti in ordine alfabetico per cognome")

    # === 16. INFO ===
    add_heading(doc, "16. Info & Crediti", level=1)
    add_para(doc,
             "Pagina informativa con i dati di contatto del Consiglio dell'Ordine "
             "(disponibili anche offline) e i crediti dell'app:")
    add_heading(doc, "Contatti del Consiglio (offline)", level=2)
    for s in [
        "Sede: Centro Direzionale, Piazza Coperta — 80143 Napoli "
        "(tap → apre Google Maps)",
        "Telefono: +39 081 734 3737 (tap → avvia chiamata)",
        "Fax: +39 081 734 3010",
        "E-mail: segreteria@ordineavvocati.napoli.it (tap → client mail)",
        "PEC: segreteria@avvocatinapoli.legalmail.it",
        "Orari segreteria: Lunedì–Venerdì, 9.00–12.30",
        "Codice Fiscale: 80013690633",
        "Codice Univoco fatturazione: UF9L1M",
    ]:
        add_bullet(doc, s)

    add_heading(doc, "Crediti", level=2)
    add_bullet(doc, "Autore: Avv. Roberto Arcella")
    add_bullet(doc, "Idea e collaborazione: Commissione Informatica COA Napoli")
    add_bullet(doc, "Per conto di: Consiglio dell'Ordine degli Avvocati di Napoli")

    doc.add_page_break()

    # === 17. FUNZIONI TRASVERSALI ===
    add_heading(doc, "17. Funzionalità trasversali", level=1)

    add_heading(doc, "Tema scuro", level=2)
    add_para(doc,
             "L'app supporta automaticamente il tema scuro/chiaro in base alle "
             "preferenze di sistema del telefono. Anche le mini-webapp incluse "
             "si adattano al tema.")

    add_heading(doc, "Funzionamento offline", level=2)
    add_para(doc,
             "La maggior parte degli strumenti funziona senza connessione: "
             "circa 13 calcolatori sono completamente autonomi (icona ☁), gli "
             "altri richiedono la prima apertura con internet (icona 📶). "
             "I contatti del Consiglio sono sempre disponibili offline. Le "
             "ultime news lette restano consultabili offline grazie alla cache.")

    add_heading(doc, "Apertura siti esterni", level=2)
    add_para(doc,
             "I siti istituzionali integrati (PST, GA, Sito COA, ecc.) si "
             "aprono nel browser interno dell'app per evitare uscite "
             "dall'esperienza utente. I siti che richiedono comportamenti "
             "particolari (Riconosco, SIGP) vengono aperti in Chrome Custom "
             "Tabs per garantire la corretta gestione di cookie e sessione.")

    add_heading(doc, "Pull-to-refresh", level=2)
    add_para(doc,
             "Nelle pagine di news (sia del COA che delle fonti del processo "
             "telematico), tirare verso il basso aggiorna la lista dei contenuti.")

    add_heading(doc, "Condivisione", level=2)
    add_para(doc,
             "Il pulsante condividi presente nei dettagli delle news permette di "
             "inviarle ad altre app del telefono (WhatsApp, e-mail, Telegram, "
             "ecc.). Anche le mini-webapp che producono testi (calcoli, modelli) "
             "possono inviare il risultato via WhatsApp grazie all'integrazione "
             "automatica.")

    doc.add_page_break()

    # === 18. PRIVACY & SICUREZZA ===
    add_heading(doc, "18. Privacy e sicurezza", level=1)
    add_para(doc,
             "L'app è progettata con attenzione alla privacy degli utenti:",
             bold=True)
    for s in [
        "Le password dell'area riservata non vengono mai viste né memorizzate "
        "dall'app: il login avviene direttamente sul sito ufficiale.",
        "I dati personali eventualmente inseriti nei calcolatori restano sul "
        "telefono e non vengono trasmessi a server esterni.",
        "I cookie di sessione del sito ufficiale sono memorizzati nel browser "
        "interno dell'app, esattamente come in un browser normale.",
        "Non sono presenti tracker pubblicitari né strumenti di profilazione.",
        "Le news vengono recuperate dall'API REST ufficiale del sito del COA, "
        "che è pubblica e non richiede autenticazione.",
    ]:
        add_bullet(doc, s)

    # === 19. RISOLUZIONE PROBLEMI ===
    add_heading(doc, "19. Risoluzione problemi", level=1)

    add_heading(doc, "L'app non scarica le news", level=2)
    add_para(doc,
             "Verificare la connessione a internet. Se persiste, tirare la "
             "lista delle news verso il basso per forzare il refresh; in caso "
             "di errore di rete viene mostrato un messaggio con la possibilità "
             "di riprovare o di aprire il sito direttamente in browser.")

    add_heading(doc, "Una mini-app non scorre", level=2)
    add_para(doc,
             "Toccare brevemente lo schermo per attivare il gesture handler. "
             "Se il problema persiste, chiudere e riaprire la mini-app dalla "
             "voce Strumenti.")

    add_heading(doc, "Un sito istituzionale non carica", level=2)
    add_para(doc,
             "Alcuni siti del Ministero (es. SIGP) sono \"di vecchia generazione\" e "
             "potrebbero apparire piccoli; usare la pinza con due dita per "
             "ingrandire. In caso di lentezza, dopo 5 secondi compare un "
             "pulsante \"Apri in browser\" per usare il browser di sistema.")

    add_heading(doc, "Banner cookie ricorrente", level=2)
    add_para(doc,
             "L'app conserva in memoria persistente i cookie del browser "
             "interno: una volta accettato il banner privacy di un sito, non "
             "dovrebbe ripresentarsi alle aperture successive (la persistenza "
             "viene salvata quando si chiude l'app).")

    # === FOOTER ===
    doc.add_page_break()
    foot = doc.add_paragraph()
    foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = foot.add_run("— Fine del Manuale —")
    r.italic = True
    r.font.color.rgb = RGBColor(*MUTED)

    foot2 = doc.add_paragraph()
    foot2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = foot2.add_run("App Ordine Avvocati Napoli — Documento generato automaticamente")
    r.italic = True
    r.font.size = Pt(9)
    r.font.color.rgb = RGBColor(*MUTED)

    doc.save(str(OUTPUT))
    print(f"\nOK: {OUTPUT}")
    print(f"Dimensione: {OUTPUT.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    print("Genero le immagini wireframe…")
    images = generate_images()
    print("\nCompongo il manuale…")
    build_manuale(images)
