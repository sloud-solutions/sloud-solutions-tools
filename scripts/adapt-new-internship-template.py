"""
One-off script, run once and commit the resulting .docx: adapts the new
Sloud-Training-Internship-Offer-Letter.docx reference file (already copied
into offerletter/internship/) for this system:

  1. Bakes in company-wide policy constants that shouldn't vary per letter
     (leave days, review week, programme length cap, data-retention periods,
     conversion-rating thresholds) as plain fixed text, removing their
     brackets.
  2. Makes "Role title" dynamic: "Trainee Intern" -> "Trainee Intern -
     [Specialist Area]" in both the particulars table and Annexure A1, so
     offer-letter.ts can fill in the domain (Digital Marketing, DevOps, ...).
  3. Makes the Subject line editable: replaces the fixed subject text with
     "[Subject Line]", which offer-letter.ts fills from a form field
     (defaulting to a computed value if left blank).
"""
import zipfile
import io
from docx import Document

PATH = "offerletter/internship/sloud-internship-letter-template.docx"

FIXED_REPLACEMENTS = [
    ("[one (1)] day off", "one (1) day off"),
    ("[Week 6]", "Week 6"),
    ("not exceed [six (6)] months", "not exceed six (6) months"),
    ("deleted within [90] days", "deleted within 90 days"),
    ("kept for up to [three (3)] years", "kept for up to three (3) years"),
    (
        "Average final rating of [3.5] or above, with no area below [3]",
        "Average final rating of 3.5 or above, with no area below 3",
    ),
    ("[Monday to Friday]", "Monday to Friday"),
    ("up to [6] hours a day", "up to 6 hours a day"),
    ("within [seven (7)] days after the Term ends", "within seven (7) days after the Term ends"),
]

with zipfile.ZipFile(PATH, "r") as zin:
    names = zin.namelist()
    data = {name: zin.read(name) for name in names}

xml = data["word/document.xml"].decode("utf-8")

for old, new in FIXED_REPLACEMENTS:
    assert old in xml, f"not found: {old!r}"
    xml = xml.replace(old, new)

data["word/document.xml"] = xml.encode("utf-8")

buf = io.BytesIO()
with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zout:
    for name in names:
        zout.writestr(name, data[name])
with open(PATH, "wb") as f:
    f.write(buf.getvalue())

# --- Dynamic Role title + Subject line (python-docx, precise cell/paragraph targeting) ---
doc = Document(PATH)

table1 = doc.tables[1]  # particulars
table3 = doc.tables[3]  # Annexure A1
for table in (table1, table3):
    cell = table.rows[0].cells[1]
    assert cell.text.strip() == "Trainee Intern", f"unexpected role cell text: {cell.text!r}"
    runs = cell.paragraphs[0].runs
    runs[0].text = "Trainee Intern – [Specialist Area]"
    for extra in runs[1:]:
        extra.text = ""

subject_para = next(p for p in doc.paragraphs if p.text.startswith("Subject: Offer of Unpaid Training Internship"))
runs = subject_para.runs
runs[0].text = "Subject: [Subject Line]"
for extra in runs[1:]:
    extra.text = ""

doc.save(PATH)
print("done")
