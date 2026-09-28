"""
One-off script to fix the offer-letter .docx templates:
  1. Replace the existing bottom banner image -- a badly-cropped sliver of
     the brand banner (2508x239, showing only a fragment of text) -- with
     the full, correct banner image, in place (same paragraph, same slot
     right after the signature block).
  2. Explicitly nil out cell-level borders/shading and vertically center
     both header cells (logo left, address right), belt-and-suspenders
     alongside the table-level "none" borders already set -- the header's
     logo (already present, untouched) and address just weren't vertically
     aligned with each other.
  3. Add breathing room to the candidate To/Name/Address/Email/Phone block
     (was ~1pt between lines -- too cramped to read as a proper block) and
     make the candidate's name a touch more prominent.

Run once locally (`python3 scripts/fix-offer-letter-templates.py`) and
commit the resulting .docx files -- these are binary templates, not
something the app generates at build/runtime.
"""
from PIL import Image
from docx import Document
from docx.shared import Pt
from docx.enum.table import WD_ALIGN_VERTICAL
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

TEMPLATES = [
    "offerletter/internship/sloud-internship-letter-template.docx",
    "offerletter/full-time/sloud-fulltime-letter-template.docx",
    "offerletter/part-time/sloud-parttime-letter-template.docx",
]
BANNER_SOURCE = "public/images/brand/banner-strategy-today.webp"  # 2508x627
ADDRESS_BLOCK_TEXTS = {"To,", "[Candidate Name]", "[Address, City, State, PIN]", "Email: [Email]", "Phone: [Phone]"}

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
WP_NS = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"


def nil_cell_borders(cell):
    tcPr = cell._tc.get_or_add_tcPr()
    borders = OxmlElement("w:tcBorders")
    for edge in ("top", "left", "bottom", "right"):
        el = OxmlElement(f"w:{edge}")
        el.set(qn("w:val"), "nil")
        borders.append(el)
    tcPr.append(borders)


def fix_header(doc):
    table = doc.tables[0]
    left_cell, right_cell = table.rows[0].cells
    nil_cell_borders(left_cell)
    nil_cell_borders(right_cell)
    left_cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    right_cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER


def fix_address_block(doc):
    for p in doc.paragraphs:
        if p.text.strip() in ADDRESS_BLOCK_TEXTS:
            p.paragraph_format.space_after = Pt(4)
        if p.text.strip() == "[Candidate Name]":
            for run in p.runs:
                run.font.size = Pt(12)


def replace_bottom_banner(doc, banner_png_path, banner_w, banner_h):
    """Finds the paragraph holding the existing (badly-cropped) banner
    drawing and swaps in the correct image + corrected aspect ratio,
    in place -- same slot, no duplicate image added."""
    body = doc.element.body
    target_p = None
    for p in body.iterfind(qn("w:p")):
        if p.findall(".//" + qn("w:drawing")):
            target_p = p  # last paragraph with a drawing = the bottom banner (logo is inside the header table, not body-level)
    if target_p is None:
        raise RuntimeError("Could not find the existing bottom banner image paragraph.")

    blip = target_p.find(".//{http://schemas.openxmlformats.org/drawingml/2006/main}blip")
    embed_id = blip.get(qn("r:embed"))
    image_part = doc.part.rels[embed_id].target_part
    image_part._blob = open(banner_png_path, "rb").read()

    # Correct the displayed aspect ratio to match the new (wider, shorter) image.
    for extent in target_p.findall(".//{%s}extent" % WP_NS):
        extent.set("cx", str(banner_w))
        extent.set("cy", str(banner_h))
    for ext in target_p.findall(".//{http://schemas.openxmlformats.org/drawingml/2006/main}ext"):
        ext.set("cx", str(banner_w))
        ext.set("cy", str(banner_h))


def main():
    png_banner = "public/images/brand/_banner-for-docx.png"
    Image.open(BANNER_SOURCE).convert("RGB").save(png_banner, "PNG")

    # Keep the existing banner's on-page width (4457700 EMU ~= 4.88in),
    # recompute height for the real 2508x627 aspect ratio (was stretched
    # from a 2508x239 crop before).
    width_emu = 4457700
    height_emu = round(width_emu * 627 / 2508)

    for path in TEMPLATES:
        doc = Document(path)
        fix_header(doc)
        fix_address_block(doc)
        replace_bottom_banner(doc, png_banner, width_emu, height_emu)
        doc.save(path)
        print(f"updated {path}")


if __name__ == "__main__":
    main()
