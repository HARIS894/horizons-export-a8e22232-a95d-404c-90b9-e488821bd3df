import json
import re
from pathlib import Path

workspace = Path(r"c:\Users\Harish\Desktop\horizons-export-a8e22232-a95d-404c-90b9-e488821bd3df")
out_path = workspace / "src" / "data" / "healthcare-topic-map.json"
out_path.parent.mkdir(parents=True, exist_ok=True)

categories = [
    ("Home Nursing", [
        "home nursing services", "home nurse for elderly", "24 hour home nursing", "best home nursing care", "skilled nursing at home", "home nursing for post surgery", "home nurse near me", "home nursing care package", "medical nursing at home", "home nursing for chronic illness", "home nursing services cost", "home nurse for diabetes", "home nurse for stroke recovery", "home nursing for palliative care", "home nursing for cancer patients", "home nursing for elderly parents", "home nursing after hospital discharge", "home nursing services for adults", "nursing care at home", "home care nurse", "home nursing agency", "professional home nursing", "home nursing support", "home nursing consultation"
    ]),
    ("ICU Care", [
        "icu care at home", "home icu services", "critical care at home", "icu level care at home", "advanced icu support at home", "icu care for adults", "icu nurse at home", "home ventilator care", "icu monitoring at home", "home icu setup", "icu care package", "advanced life support at home", "home icu for stroke", "icu care near me", "home intensive care", "critical care nursing at home", "icu services for home patients", "home icu equipment", "icu care after discharge", "home icu consultation", "home icu for chronic patients", "icu at home service", "at home intensive care", "tele icu support"
    ]),
    ("Cancer Care", [
        "cancer care at home", "home cancer care services", "best cancer care at home", "cancer nursing care", "home care for cancer patient", "cancer support at home", "palliative cancer care at home", "cancer treatment support at home", "home chemotherapy support", "home care for oncology patients", "cancer rehab at home", "cancer symptom management at home", "home cancer care nurse", "oncology home care", "cancer caregiver support", "cancer care near me", "home cancer nutrition support", "home oncologist consultation", "cancer care package", "cancer care for elderly", "home palliative oncology", "home care for terminal cancer", "cancer patient attendant", "cancer recovery at home"
    ]),
    ("Stroke Care", [
        "stroke care at home", "home stroke rehabilitation", "stroke recovery at home", "stroke physiotherapy at home", "stroke nursing care", "stroke patient care at home", "best stroke care services", "stroke rehab services", "home care after stroke", "stroke caregiver support", "stroke recovery nurse", "home stroke therapy", "post stroke care at home", "stroke support services", "stroke physiotherapist at home", "stroke care package", "home stroke monitoring", "stroke follow up care", "stroke rehabilitation near me", "home care for hemiplegia", "stroke patient attendant", "stroke speech therapy at home", "stroke care consultation", "home stroke recovery plan"
    ]),
    ("Neurology", [
        "neurology care at home", "home neurology services", "neurology nurse at home", "neurology patient care", "home care for neurological patients", "neurology rehabilitation at home", "neurology consultation at home", "brain care at home", "memory care at home", "home care for parkinson disease", "parkinson care at home", "epilepsy care at home", "home neurology support", "neurology treatment at home", "neurology follow up at home", "home care for dementia", "neurology care near me", "home brain care", "neurology care package", "neurology rehab services", "neuro physiotherapy at home", "home care for seizure patients", "neurology home nurse", "home neurology assessment"
    ]),
    ("Cardiology", [
        "cardiology care at home", "home heart care services", "cardiac nursing at home", "heart care at home", "home ECG service", "cardiac monitoring at home", "home cardiology consultation", "heart failure care at home", "home blood pressure monitoring", "cardiac rehab at home", "heart care package", "cardiac care nurse", "home post heart surgery care", "cardiology support at home", "home care for cardiac patients", "cardiology follow up at home", "heart disease care at home", "home pulse oximeter service", "cardiac care near me", "home rehabilitation after heart surgery", "heart care for elderly", "home cardiology assessment", "cardiac physiotherapy at home", "home heart monitoring"
    ]),
    ("Orthopedic Care", [
        "orthopedic care at home", "home orthopedic services", "orthopedic nursing care", "joint replacement care at home", "home physiotherapy for orthopedic care", "orthopedic rehab at home", "bone care at home", "home care after fracture", "orthopedic consultation at home", "home knee care", "home spine care", "orthopedic caregiver support", "orthopedic treatment at home", "home mobility support", "orthopedic care package", "musculoskeletal care at home", "post surgery orthopedic care", "home care for arthritis", "orthopedic equipment at home", "orthopedic rehab near me", "home physiotherapy for joints", "home fracture recovery care", "orthopedic care consultation", "home orthopedic assessment"
    ]),
    ("Respiratory Care", [
        "respiratory care at home", "home respiratory therapy", "oxygen therapy at home", "asthma care at home", "copd care at home", "home nebulization service", "respiratory nursing at home", "home breathing support", "home ventilator support", "respiratory care package", "home care for lung disease", "breathing care at home", "home inhalation therapy", "respiratory rehab at home", "home spirometry service", "respiratory care for elderly", "home oxygen concentrator", "respiratory support near me", "home pulmonary care", "home respiratory consultation", "chronic respiratory care at home", "home care for asthma", "home respiratory nurse", "respiratory monitoring at home"
    ]),
    ("Elder Care", [
        "elder care at home", "home elder care services", "elderly care at home", "senior care at home", "home care for elderly parents", "elder care nurse", "elderly nursing care", "home caregiver for seniors", "senior home care", "elder care package", "best elder care services", "home support for elderly", "elder care near me", "home companionship care", "elderly care consultation", "home care for dementia elderly", "mobility support for seniors", "elder care after hospital", "home support for geriatrics", "senior care services", "elderly care plan", "home care for elderly with chronic disease", "elder care assessment", "geriatric care at home"
    ]),
    ("Mother & Baby", [
        "mother and baby care at home", "postpartum care at home", "newborn care at home", "home baby care services", "home maternity care", "postnatal care at home", "baby nursing at home", "newborn feeding support", "mother care after delivery", "home baby massage", "postpartum physiotherapy at home", "home lactation support", "mother and baby care package", "baby care nurse at home", "home newborn monitoring", "postpartum recovery at home", "maternity care at home", "home care for newborn", "newborn care consultation", "postpartum care near me", "home maternal support", "mother care services", "home baby health check", "home newborn care"
    ]),
    ("Doctor at Home", [
        "doctor at home", "home doctor visit", "doctor visit at home", "home physician services", "doctor consultation at home", "doctor on call at home", "home doctor near me", "best doctor at home service", "doctor at home for elderly", "home doctor for fever", "home doctor for chronic illness", "doctor home visit package", "mobile doctor service", "home doctor consultation", "doctor at home for kids", "family doctor at home", "home doctor appointment", "doctor on home visit", "home physician near me", "doctor at home services cost", "general physician at home", "home doctor for senior citizens", "doctor at home booking", "home doctors service", "medical consultation at home"
    ]),
    ("Lab Tests", [
        "lab test at home", "home blood test", "home sample collection", "home diagnostic tests", "home pathology test", "blood test at home", "urine test at home", "home lab test service", "home sample pickup", "at home laboratory test", "home tests for health", "lab test service near me", "home pathology collection", "doctor prescribed lab test at home", "home test package", "home diagnostic lab", "home test booking", "lab collection at home", "home blood sample collection", "home lab test for elderly", "health screening at home", "home sample testing", "home blood work", "home lab report delivery", "home pathology services"
    ]),
    ("Medical Equipment", [
        "medical equipment at home", "home medical equipment", "oxygen cylinder at home", "hospital bed on rent", "wheelchair on rent", "walker on rent", "home ventilator rental", "medical equipment rental", "home oxygen concentrator rental", "patient equipment at home", "medical devices at home", "equipment for home care", "home care equipment", "medical equipment rental near me", "mobility aids at home", "home nursing equipment", "oxygen support at home", "hospital equipment at home", "home care supplies", "medical bed rental", "wheelchair rental near me", "home rehabilitation equipment", "portable oxygen cylinder", "medical equipment delivery", "home equipment consultation"
    ]),
    ("Emergency Care", [
        "emergency care at home", "home emergency medical care", "urgent care at home", "emergency doctor at home", "home emergency response", "24 hour emergency care", "home ambulance service", "emergency medical support at home", "home emergency nurse", "emergency care near me", "urgent home care", "home emergency consultation", "medical emergency at home", "emergency assistance at home", "home critical care", "emergency care package", "same day emergency care", "home emergency nurse service", "urgent doctor at home", "emergency support for seniors", "emergency care for elderly", "home emergency transport", "home urgent care", "medical emergency support"
    ]),
    ("NRI Healthcare", [
        "nri healthcare services", "home healthcare for nri", "nri medical support", "nri elder care", "nri doctor at home", "nri care for parents", "healthcare for nri families", "medical support for nri", "nri home nursing", "nri patient care", "nri care package", "home care for nri parents", "nri healthcare consultation", "nri medical assistance", "nri doctor consultation", "healthcare services for nri", "care for parents abroad", "nri care near me", "remote healthcare for nri", "nri medical coordinator", "nri patient attendant", "nri elder care services", "home care for nri family", "nri nursing services"
    ]),
    ("Palliative Care", [
        "palliative care at home", "home palliative care services", "best palliative care", "palliative nursing at home", "home care for terminal illness", "palliative support at home", "home hospice care", "palliative medicine at home", "home pain care", "comfort care at home", "palliative care nurse", "home end of life care", "home supportive care", "palliative care for family", "palliative care consultation", "home care for advanced illness", "palliative care near me", "terminal illness care at home", "compassionate care at home", "home palliative support", "palliative care package", "advanced illness care at home", "home comfort support", "palliative rehabilitation at home"
    ]),
    ("Final Journey", [
        "final journey care", "end of life care at home", "home hospice services", "final journey support", "compassionate end of life care", "home final journey care", "terminal care at home", "home care during final journey", "dignity care at home", "family support during final journey", "home palliative end of life care", "final journey nurse", "end of life support at home", "home comfort care", "final journey care package", "care for advanced illness at home", "terminal care support", "home final journey consultation", "end of life care near me", "compassionate care for final journey", "home funeral support guidance", "home care for final days", "final journey planning", "advanced illness support at home"
    ]),
    ("Home Physiotherapy", [
        "home physiotherapy", "physiotherapy at home", "home physical therapy", "best physiotherapy at home", "home rehab therapy", "physiotherapy near me", "mobile physiotherapy", "home physiotherapy services", "orthopedic physiotherapy at home", "neurology physiotherapy at home", "cardiac physiotherapy at home", "post surgery physiotherapy at home", "home physiotherapy for elderly", "home exercise therapy", "physiotherapy package at home", "home physiotherapy consultation", "rehabilitation services at home", "home exercise program", "physio at home", "home mobility therapy", "post stroke physiotherapy", "home pain management therapy", "home physiotherapy booking", "home therapy services", "home physiotherapy assessment"
    ]),
    ("Patient Attendant", [
        "patient attendant at home", "home patient attendant", "attendant care at home", "patient caregiver at home", "home attendant services", "best patient attendant", "elderly attendant service", "patient attendant near me", "home nursing attendant", "attendant for elderly", "patient support at home", "home attendant for post surgery", "attendant for chronic illness", "home care attendant", "patient attendant package", "caregiver at home", "patient attendant service near me", "medical attendant at home", "home attendant for disability", "patient attendant for seniors", "home attendant consultation", "attendant for bedridden patient", "home attendant support", "patient care attendant", "home attendant booking"
    ]),
    ("Home Diagnostics", [
        "home diagnostics", "home diagnostic services", "at home diagnostics", "home health screening", "home wellness screening", "home diagnostic test service", "home diagnostic package", "home diagnostics near me", "home health checkup", "home diagnostic consultation", "home vitals check", "home pathology diagnostics", "home diagnostic support", "home medical diagnostics", "home preventive checkup", "diagnostic service at home", "home health diagnostics", "home test and diagnostics", "home diagnostics for chronic disease", "home health assessment", "home diagnostics booking", "home diagnostic care", "home screening tests"
    ])
]


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return re.sub(r"-+", "-", text).strip("-")


def search_intent(keyword: str) -> str:
    if any(term in keyword for term in ["near me", "service", "services", "booking", "cost", "package", "consultation", "support", "care package", "package"]):
        return "Commercial"
    if any(term in keyword for term in ["care at home", "services", "support", "rehabilitation", "therapy", "diagnostics", "screening", "test", "assessment"]):
        return "Informational"
    return "Transactional"


def meta_title(keyword: str) -> str:
    return f"{keyword.title()} | InstantCare"


def meta_description(keyword: str) -> str:
    return f"Explore {keyword} with InstantCare for trusted home healthcare, medical support and seamless care planning."


result = {
    "brand": "InstantCare",
    "goal": "High-intent healthcare SEO topic map",
    "totalTopics": 0,
    "categories": []
}

for category_name, keywords in categories:
    topics = []
    for index, keyword in enumerate(keywords, 1):
        slug = slugify(keyword)
        if category_name == "Doctor at Home":
            related_services = ["Home Nursing", "Lab Tests", "Home Physiotherapy"]
        elif category_name == "Lab Tests":
            related_services = ["Doctor at Home", "Home Diagnostics", "Home Nursing"]
        elif category_name == "Medical Equipment":
            related_services = ["Home Nursing", "Emergency Care", "Patient Attendant"]
        elif category_name == "Emergency Care":
            related_services = ["Doctor at Home", "ICU Care", "Medical Equipment"]
        elif category_name == "Mother & Baby":
            related_services = ["Doctor at Home", "Lab Tests", "Home Nursing"]
        elif category_name in {"Palliative Care", "Final Journey"}:
            related_services = ["Elder Care", "Home Nursing", "Doctor at Home"]
        elif category_name == "NRI Healthcare":
            related_services = ["Doctor at Home", "Elder Care", "Home Nursing"]
        elif category_name == "Patient Attendant":
            related_services = ["Home Nursing", "Elder Care", "Emergency Care"]
        elif category_name == "Home Diagnostics":
            related_services = ["Lab Tests", "Doctor at Home", "Home Nursing"]
        else:
            related_services = ["Doctor at Home", "Home Nursing", "Home Physiotherapy"]

        topics.append({
            "id": f"{slugify(category_name)}-{index:02d}",
            "primaryKeyword": keyword,
            "searchIntent": search_intent(keyword),
            "suggestedUrl": f"/{slug}",
            "suggestedH1": f"{keyword.title()} for Trusted Care",
            "metaTitle": meta_title(keyword),
            "metaDescription": meta_description(keyword),
            "relatedServices": related_services,
            "internalLinks": [f"/{slugify(category_name)}", "/services", "/healthcare-library"],
            "faqIdeas": [
                f"What should I expect from {keyword}?",
                f"How is {keyword} different from hospital care?",
                f"When should I book {keyword}?"
            ]
        })

    result["categories"].append({
        "category": category_name,
        "slug": slugify(category_name),
        "topicCount": len(topics),
        "topics": topics
    })

result["totalTopics"] = sum(len(category["topics"]) for category in result["categories"])

with out_path.open("w", encoding="utf-8") as handle:
    json.dump(result, handle, indent=2, ensure_ascii=False)

print(f"Created {out_path}")
print(f"Topics: {result['totalTopics']}")
