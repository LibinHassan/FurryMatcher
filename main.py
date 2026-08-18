"""
This is the main server for FurryMatcher. It handles:
- Chatting with Adam, the AI adoption assistant
- Matching users to pets based on their answers
- Answering follow up questions about a specific pet
- Recognising a pet's breed from a photo
- Letting someone give up a pet for adoption 
"""


from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import spacy
import numpy as np
import tensorflow as tf
from tensorflow import keras
from PIL import Image, ImageOps
import io
import os
import json
import time
import requests
import random

nlp = spacy.load("en_core_web_sm")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
app.mount("/photos", StaticFiles(directory="/Users/libinhassan/FurryMatcher-backend/uploaded_photos"), name="photos")

class Message(BaseModel):
    # The shape of a chat message coming in from the frontend
    message: str
    conversation: list =[]
    path: str = ""
    answered: list = []

# The 7 questions Adam asks someone who wants to adopt a pet.
ADOPT_QUESTIONS =[
    "Are you looking for a cat or a dog?",
    "What breed are you interested in?",
    "What energy level suits your lifestyle? (low, medium, high)",
    "What age are you looking for? (kitten/puppy, teenager, adult, senior)",
    "Would you prefer an indoor or outdoor pet?",
    "Do you have children at home?",
    "Do you have any other pets at home?"
]

# The 11 questions Adam asks someone giving up a pet.
GIVE_UP_QUESTIONS =[
    "What is the pet's name?",
    "Is your pet a cat or a dog?",
    "Is your pet a male or female?",
    "Would you like to upload a photo of your pet?",
    "What breed is your pet?",
    "What energy level does your pet have? (low, medium or high)",
    "How old is your pet?",
    "Is your pet indoor or outdoor?",
    "Is your pet good with children?",
    "Is your pet good with other animals?",
    "Is your pet microchipped? (required by UK law)"

]

# A list of dog breeds the app recognises when someone mentions one.
DOG_BREEDS = ["labrador", "bulldog", "beagle", "german shepherd", "husky", "chihuahua", "pug", "spaniel", "terrier", "golden retriever", "dachshund", "boxer", "collie", "pitbull", "staffy", "sausage dog", "jack russell", "cockapoo", "cavapoo", "labradoodle", "goldendoodle", "poodle", "maltipoo", "whippet", "springer spaniel", "retriever", "doberman", "pomeranian", "cane corso", "rottweiler", "schnauzer", "shih tzu", "yorkshire terrier", "yorkie"]


CAT_BREEDS = ["british shorthair", "bengal", "ragdoll", "maine coon", "siamese", "persian", "scottish fold", "sphynx", "norwegian forest", "russian blue", "burmese", "abyssinian", "birman", "ragamuffin", "siberian", "tabby", "moggy", "domestic shorthair", "himalayan", "european shorthair"]

# Little personality blurbs for each breed, used when writing about a pet someone's giving up.

BREED_TRAITS = {
    "ragdoll": "known for being gentle, calm and deeply affectionate, often relaxing completely when held and generally with children and other pets",
    "labrador": "friendly, affectionate and highly sociable, loves human company and tends to get along well with children and other pets, though needs regular exercise to stay balanced",
    "beagle": "friendly, curious and highly sociable, gets along well with people and other dogs, but craves company and can be vocal or destructive if left alone for too long",
    "german shepherd": "intelligent, loyal and confident, deeply devoted to their family and gentle with children when well socialised, through naturally watchful around strangers",
    "golden retriever": "gentle, friendly and eager to please, known for being especially patient and forgiving with children and rarely aggressive",
    "siamese": "vocal, social and deeply affectionate, forms a strong bond with their owner and craves company, so does best when not left alone for long periods",
    "persian": "calm, gentle and affectionate, generally friendly with people and other pets and suited to a quiet, relaxed home",
    "maine coon": "large, gentle and sociable, often called a gentle giant, playful and affectionate without being overly demanding and generally good with children and other pets",
    "bulldog": "gentle, friendly and loyal, tends to be calm and affectionate with families and good with children, though can be stubborn",
    "husky": "friendly, outgoing and energetic, gets along well with people and often other dogs, but indepedent minded and needs plenty of exercise and mental stimulation",

}

def detect_species(message: str) -> str:
    # Has a quick look at a message and guesses if it's about a cat or a dog.
    message_lower = message.lower()
    if any(breed in message_lower for breed in DOG_BREEDS):
        return "dog"
    if any(breed in message_lower for breed in CAT_BREEDS):
        return "cat"
    if "dog" in message_lower:
        return "dog"
    if "cat" in message_lower:
        return "cat"
    return ""

def extract_preferences(message: str) -> dict:
    # Reads one message and pulls out anything mentioned, like species, breed, energy level, age, indoor or outdoor, children and other pets.
    found = {
        "species": None,
        "breed": None,
        "energy": None,
        "age": None,
        "indoor_outdoor": None,
        "children": None,
        "other_pets": None,
    }

    text = message.lower()
    doc = nlp(text)

    for breed in DOG_BREEDS:
        if breed in text:
            found["species"] = "dog"
            found["breed"] = breed
            break
        if not found["species"]:
            for breed in CAT_BREEDS:
                if breed in text:
                    found["species"] = "cat"
                    found["breed"] = breed
                    break

    if not found ["species"]:
        if "dog" in text:
            found["species"] = "dog"
        elif "cat" in text:
            found["species"] = "cat"

# Looks at every describing word in the message to guess energy level.
# This checks the whole message, not just words about the pet, so a word like "active" describing the user themself can still count.
    for token in doc:
        if token.pos_ == "ADJ":
            if token.text in ["energetic", "active", "lively", "boisterous", "playful", "high"]:
                found["energy"] = "high"
            elif token.text in ["calm", "lazy", "relaxed", "gentle", "chilled", "low"]:
                found["energy"] = "low"
            elif token.text in ["moderate", "average", "medium"]:
                found["energy"] = "medium"


    age_words = {
        "kitten": "kitten",
        "puppy": "puppy",
        "baby": "baby",
        "young": "young",
        "teenager": "teenager",
        "adolescent": "teenager",
        "adult": "adult",
        "grown": "adult",
        "senior": "senior",
        "old": "senior",
        "elderly": "senior",
    }

    # If more than one age word shows up, use whichever one appears first, since that's usually the one the user actually meant.
    earliest_position = None
    for word, category in age_words.items():
        position = text.find(word)
        if position != -1 and (earliest_position is None or position < earliest_position):
            earliest_position = position
            found["age"] = category

    # "baby" or "young" on their own are vague, so turn them into kitten or puppy once we know if it's a cat or a dog.
    if found["age"] in ("baby", "young"):
        if found["species"] == "cat":
            found["age"] = "kitten"
        elif found["species"] == "dog":
            found["age"] = "puppy"
        else:
            found["age"] = None

    if any(word in text for word in ["indoor", "inside", "house", "flat", "apartment"]):
        found["indoor_outdoor"] = "indoor"
    elif any(word in text for word in ["outdoor", "outside", "garden", "yard"]):
        found["indoor_outdoor"] = "outdoor"


    # Check for "no children" type phrases first, so they don't get wrongly picked up by the simpler "children" keyword check below.
    if any(phrase in text for phrase in [
        "no kids", "no children", "no child", "childless", "no family",
        "don't have children", "do not have children", "dont have children",
        "don't have kids", "do not have kids", "don't have kids",
        "without children", "without kids"
     ]):
        found["children"] = False
    elif any(word in text for word in ["kids", "children", "child", "baby", "toddler", "son", "daughter", "family"]):
        found["children"] = True
    if any(word in text for word in ["no other pets", "no pets", "only pet", "no animals"]):
        found["other_pets"] = False
    elif any(word in text for word in ["another dog", "another cat", "other pets", "other animals", "already have a pet", "existing pet", "other dog", "other cat"]):
        found["other_pets"] = True

    return found


def load_pets():
    with open("/Users/libinhassan/FurryMatcher-backend/pets.json", "r") as f:
        return json.load(f)

def build_match_reason(pet, species, breed, energy, indoor_outdoor, children, other_pets):
    # Writes the friendly sentence explaining why this pet was matched.
    reasons = []
    if species:
        reasons.append(f"they're a {species}, just like you were looking for")
    if breed and breed.lower() in pet["breed"].lower():
        reasons.append(f"they're a {pet['breed']}, matching your preferred breed")
    if energy and pet["energy"] == energy:
        reasons.append(f"their {energy} energy level fits what you're after")
    if indoor_outdoor and pet["indoor_outdoor"] == indoor_outdoor:
        reasons.append(f"they're suited to {indoor_outdoor} living")
    if children is True and pet["children_ok"] is True:
        reasons.append("they're good with children")
    if other_pets is True and pet["other_pets_ok"] is True:
        reasons.append("they get along well with other animals")


    if not reasons:
        return f"{pet['name']} could still be a lovely match worth considering."

    if len(reasons) > 1:
        joined = ", ".join(reasons[:-1]) + f", and {reasons[-1]}"
    else:
        joined = reasons[0]
    return joined

# Finds pets that match the user's preferences. If there is no exact match, it relaxes the breed or age to suggest suitable alternatives.

def match_pets(species, breed, energy, age, indoor_outdoor, children, other_pets):
    pets = load_pets()

    def passes(pet, use_breed=True, use_age=True):
        if species and pet["species"] != species:
            return False
        if use_breed and breed and breed.lower() not in pet["breed"].lower():
            return False
        if energy and pet["energy"] != energy: 
            return False
        if use_age and age and pet["age"] != age:
            return False 
        if indoor_outdoor and pet["indoor_outdoor"] != indoor_outdoor:
            return False
        if children is True and pet["children_ok"] is False:
            return False
        if other_pets is True and pet["other_pets_ok"] is False:
            return False
        return True
    matches = [pet for pet in pets if passes(pet)]
    is_alternative = False
    unavailable = None


    if not matches and breed:
        relaxed = [pet for pet in pets if passes(pet, use_breed=False)]
        if relaxed:
            matches = relaxed
            is_alternative = True
            unavailable = {"type": "breed", "value": breed}

    if not matches and age:
        relaxed = [pet for pet in pets if passes(pet, use_age=False)]
        if relaxed:
            matches = relaxed
            is_alternative = True
            unavailable = {"type": "age", "value": age}


    if not matches and breed:
        relaxed = [pet for pet in pets if passes(pet, use_breed=False, use_age=False)]
        if relaxed:
            matches = relaxed
            is_alternative = True
            unavailable = {"type": "breed", "value": breed}

    for pet in matches:
        pet["summary"] = pet.get("breed_facts", f"{pet['name']} is a {pet['energy']} energy {pet['age']} {pet['breed']}, great for {pet['indoor_outdoor']} living.")
        pet["match_reason"] = build_match_reason(pet, species, breed, energy, indoor_outdoor, children, other_pets)
        pet["is_alternative"] = is_alternative

    return matches[:3], unavailable

# Saves the user's last pet matches so they can be used later.    
def saved_matches(matches):
    matches_file = "/Users/libinhassan/FurryMatcher-backend/matches.json"
    enriched_matches =[]
    for pet in matches: 
        breed_key = (pet.get("breed") or "").lower()
        enriched_pet = dict(pet)
        if breed_key in BREED_TRAITS:
            enriched_pet["breedInfo"] = BREED_TRAITS[breed_key]
        enriched_matches.append(enriched_pet)

    with open(matches_file, "w") as f:
        json.dump(enriched_matches, f, indent=4)

# Removes user's previously saved pet matches.
def clear_matches():
    matches_file = "/Users/libinhassan/FurryMatcher-backend/matches.json"
    with open(matches_file, "w") as f:
        json.dump([], f, indent=4)


# Loads the most recently saved matches so Adam can refer to them later.
def load_last_matches():
    matches_file = "/Users/libinhassan/FurryMatcher-backend/matches.json"
    try:
        with open(matches_file, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return[]

# Checks whether the user has mentioned one of their matched pets by name.
def find_mentioned_pet(message, last_matches):
    text = message.lower()
    for pet in last_matches:
        if pet["name"].lower() in text:
            return pet
    return None

# Saves questions Adam cannot answer so they can be passed to the shelter.
def log_unanswered_question(pet_name, question):
    log_file ="/Users/libinhassan/FurryMatcher-backend/unanswered_questions.json"
    try:
        with open(log_file, "r") as f:
            logged = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        logged = []

    logged.append({"pet_name": pet_name, "question": question})

    with open(log_file, "w") as f:
        json.dump(logged, f, indent=4)

# Reads the full adoption conversation and combines the user's answers into one complete set of preferences.
def extract_all_preferences(conversation, latest_message):
    combined = {
        "species": None, "breed": None, "energy": None,
        "age": None, "indoor_outdoor": None,
        "children": None, "other_pets": None,
    }
    all_messages = conversation + [{"role": "user", "content": latest_message}]
    
    for i, msg in enumerate(all_messages):
        if msg["role"] != "user":
            continue
        
        text = msg["content"].lower().strip()
        prev_question = ""
        if i > 0 and all_messages[i-1]["role"] == "assistant":
            prev_question = all_messages[i-1]["content"].lower()

        extracted = extract_preferences(text)
        for key, value in extracted.items():
            if value is not None:
                combined[key] = value


        if text in ["yes", "yeah", "yep"]:
            if "children" in prev_question:
                combined["children"] = True
            elif "other pets" in prev_question or "other animals" in prev_question:
                combined["other_pets"] = True
        elif text in ["no", "nope", "nah"]:
            if "children" in prev_question:
                combined["children"] = False
            elif "other pets" in prev_question or "other animals" in prev_question:
                combined["other_pets"] = False

        if "energy" in prev_question:
            if "low" in text:
                combined["energy"] = "low"
            elif "high" in text:
                combined["energy"] = "high"
            elif "medium" in text:
                combined["energy"] = "medium"


        if "indoor" in prev_question or "outdoor" in prev_question:
            if "indoor" in text:
                combined["indoor_outdoor"] = "indoor"
            elif "outdoor" in text:
                combined["indoor_outdoor"] = "outdoor"

    return combined

# Reads the full surrender conversation and collects the pet's details into one structured profile.
def extract_surrender_details(conversation, latest_message):
    details = {
        "name":None, "species": None, "gender": None, "breed": None, "energy": None,
        "age": None, "indoor_outdoor": None,
        "children_ok": None, "other_pets_ok": None, "microchipped": None, "is_rescue": None,
        "photo_url": None, "photo_asked": None,
    }
    all_messages = conversation + [{"role": "user", "content": latest_message}]
    user_answers = [msg["content"].strip() for msg in all_messages if msg["role"] == "user"]

    for i, msg in enumerate(all_messages):
        if msg["role"] != "user":
            continue

        text = msg["content"].lower().strip()
        prev_question = ""
        if i > 0 and all_messages[i-1]["role"] == "assistant":
            prev_question = all_messages[i-1]["content"].lower()

        extracted = extract_preferences(text)
        if extracted["species"]:
            details["species"] = extracted["species"]
        if extracted["breed"]:
            details["breed"] = extracted["breed"]
        if details["breed"] is None and "breed" in prev_question:
            if any(phrase in text for phrase in ["dont know", "don't know", "not sure", "unsure", "no idea"]):
                details["breed"] = "Unknown"
        if extracted["energy"]:
            details["energy"] = extracted["energy"]
        if extracted["age"]:
            details["age"] = extracted["age"]
        if extracted["indoor_outdoor"]:
            details["indoor_outdoor"] = extracted ["indoor_outdoor"]
        if text.startswith("[photo uploaded:"):
            if details.get("photo_url") is None:
                details["photo_url"] = msg["content"].split("] [Detected breed:")[0][len("[Photo uploaded: "):]
            details["photo_asked"] = True
            if details.get("breed") is None and "detected breed:" in text:
                detected_breed = msg["content"].split("[Detected breed: ")[1].rstrip("]").strip().replace("_", " ")
                details["breed"] = detected_breed
        if "rescue" in text and details["is_rescue"] is None:
            details["is_rescue"] = True
        if "name" in prev_question and details["name"] is None:
            no_name_phrases = ["no name", "not named", "unnamed", "dont know", "don't know", "not sure", "havent decided", "haven't decided"]
            if any(phrase in text for phrase in no_name_phrases):
                details["name"] = "Unnamed rescue"
            else:
                details["name"] = msg["content"].strip().title()

        starts_with_yes = text.startswith(("yes", "yeah", "yep"))
        starts_with_no = text.startswith(("no", "nope", "nah")) and not text.startswith("not sure")

        if starts_with_yes:
            if "children" in prev_question:
                details["children_ok"] = True
            elif "other animals" in prev_question:
                details["other_pets_ok"] = True
            elif "microchip" in prev_question:
                details["microchipped"] = True
        elif starts_with_no:
            if "children" in prev_question:
                details["children_ok"] = False
            elif "other animals" in prev_question:
                details["other_pets_ok"] = False
            elif "microchip" in prev_question:
                details["microchipped"] = False
        if "upload a photo" in prev_question and details.get("photo_asked") is None:
            if text.startswith("[photo uploaded:") or text in ["no", "nope", "nah", "skip", "no thanks"]:
                details["photo_asked"] = True
        if "male or female" in prev_question:
            if any(word in text for word in ["female", "girl", "she", "her"]):
                details["gender"] = "female"
            elif any(word in text for word in ["male", "boy", "he", "him"]):
                details["gender"] = "male"
        
    return details

# Checks which pet information is still missing and returns the next surrender question Adam needs to ask.
def get_next_give_up_question(details):
    if details["name"] is None:
        return GIVE_UP_QUESTIONS[0]
    if details["species"] is None:
        return GIVE_UP_QUESTIONS[1]
    if details.get("gender") is None:
        return GIVE_UP_QUESTIONS[2]
    if details.get("photo_asked") is None:
        return GIVE_UP_QUESTIONS[3]
    if details["breed"] is None:
        return GIVE_UP_QUESTIONS[4]
    if details["energy"] is None:
        return GIVE_UP_QUESTIONS[5]
    if details["age"] is None:
        return GIVE_UP_QUESTIONS[6]
    if details["indoor_outdoor"] is None:
        return GIVE_UP_QUESTIONS[7]
    if details["children_ok"] is None:
        return GIVE_UP_QUESTIONS[8]
    if details["other_pets_ok"] is None:
        return GIVE_UP_QUESTIONS[9]
    if details["microchipped"] is None:
        return GIVE_UP_QUESTIONS[10]
    return None

ACKNOWLEDGEMENTS = [
       "Got it, thanks for sharing that.",
       "Noted, that's helpful to know",
        "Thanks for letting me know.",
        "Good to know, thank you,",
   ]

# Uses Gemma to create a short, friendly response to the user's answer, with a predefined response used if the generated output is unsuitable.   
def generate_acknowledgement(user_answer, question_asked, gender=None):
    try:
        example_1 = "Question: Is your pet a cat or a dog? Answer: cat. Reaction: cats make wonderful companions.\n"
        example_2 = "Question: What breed is your pet? Answer: ragdoll. Reaction: Ragdolls are known for being gentle and relaxed.\n"
        example_3 = "Question: What energy level does your pet have? Answer: low. Reaction: A calmer place can suit a lot of homes well.\n"
        example_4 = "Question: is your pet indoor or outdoor? Answer: indoor. Reaction: Indoor living keeps them safe and settled.\n"
        example_5 = "Question: Is your pet good with children? Answer: yes. Reaction: That's great, make them easier to rehome.\n"
        example_6 = "Question: Is your pet microchipped? Answer: yes. Reaction: Good, that's one less thing to sort out.\n"

        all_examples = example_1 + example_2 + example_3 + example_4 + example_5 + example_6

        new_question_line = f"Question: {question_asked} Answer: {user_answer} Reaction:"
        full_prompt = all_examples + "\n" + new_question_line

        instructions = "Continue the pattern shown. Reply with only the reaction for the final question and answer, mathcing the style and legnth of examples. Never invent facts not present in the answer. No labels, no markdown."

        request_data = {
            "model": "gemma3",
            "messages": [
                {"role": "system", "content": instructions},
                {"role": "user", "content": full_prompt}
            ],
            "stream": False,
            "options": {"temperature": 0.9}
        }
        
        response = requests.post(
            "http://localhost:11434/api/chat",
            json=request_data,
            timeout=5
        )

        ai_reply = response.json()["message"]["content"]
        ai_reply = ai_reply.strip()

        looks_broken = False
        if "**" in ai_reply:
            looks_broken = True
        if "Question:" in ai_reply:
            looks_broken = True
        if "Reaction:" in ai_reply:
            looks_broken = True
        if len(ai_reply) > 150:
            looks_broken = True
        
        if looks_broken:
            return random.choice(ACKNOWLEDGEMENTS)
        else:
            return ai_reply

    except Exception:
        return random.choice(ACKNOWLEDGEMENTS)
           

# Creates and saves a pending pet profile from the information collected during the surrender conversation.
def save_surrendered_pet(details, photo_url=None):
    pending_file = "/Users/libinhassan/FurryMatcher-backend/pending_pets.json"

    try:
        with open(pending_file, "r") as f:
            pending_pets = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        pending_pets = []

    new_pet = {
        "name": details.get("name") or "Unnamed pet",
        "species": details.get("species"),
        "breed": details.get("breed") or "Unknown",
        "energy": details.get("energy"),
        "age": details.get("age"),
        "indoor_outdoor": details.get("indoor_outdoor"),
        "children_ok": details.get("children_ok"),
        "other_pets_ok": details.get ("other_pets_ok"),
        "microchipped": details.get("microchipped"),
        "is_rescue": details.get("is_rescue"),
        "photo": photo_url or "",

    }

    new_pet["summary"] = generate_pet_description(details)

    pending_pets.append(new_pet)

    with open(pending_file, "w") as f:
        json.dump(pending_pets, f, indent=4)

    return new_pet

# Uses Gemma to turn the collected pet details into a short, friendly adoption description without intentionally adding new facts.
def generate_pet_description(details):
    lines = [f"Name: {details.get('name')}"]
    breed_key = (details.get('breed') or "").lower()
    if breed_key in BREED_TRAITS:
        lines.append(f"Breed personality: {BREED_TRAITS[breed_key]}")
    if details.get('species'):
        lines.append(f"Species: {details['species']}")
    if details.get('gender'):
        lines.append(f"Gender: {details['gender']}")
    if details.get('breed') and details['breed'] != "Unknown":
        lines.append(f"Breed: {details['breed']}")
    if details.get('energy'):
        lines.append(f"Energy level: {details['energy']}")
    if details.get('age'):
        lines.append(f"Age: {details['age']}")
    if details.get('indoor_outdoor'):
        lines.append(f"Indoor_outdoor: {details['indoor_outdoor']}")
    if details.get('children_ok') is not None:
        lines.append(f"Good with children: {details['children_ok']}")
    if details.get('other_pets_ok') is not None:
        lines.append(f"Good with other animals: {details['other_pets_ok']}")
    if details.get('microchipped') is not None:
        lines.append(f"Microchipped: {details['microchipped']}")
    if details.get('is_rescue'):
        lines.append("This pet is a rescue.")

    facts = "\n".join(lines)

    response = requests.post(
        "http://localhost:11434/api/chat",
        json={
            "model": "gemma3",
            "messages": [
                {"role": "system", "content": "You are a warm, friendly pet adoption assistant writing a listing to help this specific pet find a loving home. Write 3-4 short sentences that introduce this individual animal in a genuine, perosnal way, as if you know and care about them. Connect the breed personality directly to this pet's own facts. For example if the breed trait is affectionate and the pet's energy level is low, describe them as a calm cuddly companion rather than listing the breed trait and the pet's facts seperately. If the pet's name is Unnamed rescue or similar, do not use that as their name, instead refer to them using pronouns and gentle phrases like this little one or this sweet kitten and only mention once near the start they are still waiting for a name. If the pet has a real given name, mention it naturally throughout, not just once. If the gender is given, use the matching pronoun (he/him for male, she/her for female) consistently. Never invent or guess details that aren't listed. Write directly about the pet, no preamble."},
                {"role": "user", "content": facts}
            ],
            "stream": False,
            "options": {"temperature": 1.0}
        }
    )
    text = response.json()["message"]["content"].strip()

    if details.get('gender') == 'female':
        text = text.replace(" He ", " She ").replace(" he ", " she ")
        text = text.replace(" His ", " Her ").replace(" his ", " her ")
        text = text.replace(" Him ", " Her ").replace(" him ", " her ")
    elif details.get('gender') == 'male':
        text = text.replace(" She ", " He ").replace(" she ", " he ")
        text = text.replace(" Her ", " His ").replace(" her ", " his ")
    return text

# Uses Gemma to answer questions using only the stored facts about the pet. Returns no answer when the requested information is unavailable.
def answer_pet_question(pet, question):
    base_facts = pet.get("browse_description") or pet.get("summary") or pet.get("breed_facts", "")

    extra_fields = [
        "allergies", "vaccinated", "special_diet", "medical_conditions",
        "neutered", "grooming_needs", "barks_a_lot", "ok_alone",
        "car_behaviour", "time_waiting", "surrender_reason",
        "meet_before_adopting", "adoption_fee", "included_belongings"
    ]
    extra_lines = []
    for field in extra_fields:
        if pet.get(field) is not None:
            label = field.replace("_", "").capitalize()
            extra_lines.append(f"{label}: {pet[field]}")

    facts = base_facts + "\n" + "\n".join(extra_lines)

    instructions = (
        "You are answering a question about a specific pet, using only the facts given below."
        "If the answer is genuinely not covered by these facts, reply with exactly: I DONT KNOW"
        "Do not guess or invent details. Keep your answer to 1-2 short, warm sentences."
    )

    prompt = f"Pet facts:\n{facts}\n\nQuestion: {question}"

    response = requests.post(
        "http://localhost:11434/api/chat",
        json={
            "model": "gemma3",
            "messages": [
                {"role": "system", "content": instructions},
                {"role": "user", "content": prompt}
            ],
            "stream": False,
            "options": {"temperature": 0.3}
        }
    )

    answer = response.json()["message"]["content"].strip()

    if "I DONT KNOW" in answer.upper():
        return None
    return answer


intent_cache = {}

# Determines whether the user wants to adopt or give up a pet. Obvious phrases are handled directly and Gemma classifies less clear messages.
def classify_intent(message):
    if message in intent_cache:
        return intent_cache[message]
    
    text = message.lower()

    give_up_phrases = ["give up", "giving up", "put up", "putting up", "surrender", "rehome", "re-home", "cant keep", "can't keep"]
    obvious_give_up = any(phrase in text for phrase in give_up_phrases) or ("put" in text and "up" in text and "adopt" in text )

    if obvious_give_up:
        intent_cache[message] = "give_up"
        return "give_up"

    response = requests.post(
        "http://localhost:11434/api/chat",
        json={
            "model": "gemma3",
            "messages": [
               {"role": "system", "content": "You will be given a message from someone using a pet adoption app. Reply with exactly one word: ADOPT if they want to adopt or find a pet, or GIVEUP if they want to give up, surrender, or rehome a pet they already have. Reply with only one word, nothing else "},
               {"role": "user", "content": message}
            ],
            "stream": False,
            "options": {"temperature": 0.1}
        }
    )
    reply = response.json()["message"]["content"].strip().upper()
    print("Model said:", reply)

    if "GIVE" in reply:
        result = "give_up"
    else:
        result = "adopt"
    
    intent_cache[message] = result
    return result

# Defines Adam's conversation rules, including the adoption and surrender flows, question order and how Adam would respond.
SYSTEM_PROMPT = """
You are a warm friendly assistant for FurryMatcher, a UK pet adoption app for cats and dogs only.
First message always: "Hi there! Welcome to FurryMatcher. Are you looking to adopt a pet or put one up for adoption?"
Do not repeat this greeting again in the conversation. Once the user has answered move straight to the next question without restating the greeting or previous message.

As soon as the user tells you whether they are adopting or giving up a pet, that decision is locked in for the rest of the conversation. From that point on, only ask questions from the matching list below. Never ask a question from the other list, even if the conversation gets long. If the user says they are adopting, you must only ever use the adopting questions, never the giving up questions and vice versa.

Before asking any questions, check what theuser has already told you in the conversation so far. If they have already given you the answer to a question (for example, naming a breed, an age or saying "dog" or "cat" anywhere in their message) do not ask that same question ahgain. Skip straight to the next unanswered question instead.

A single message from the user can answer more than one question at once. For example, "golden retriever" tells you both that they want a dog and what breed they want at the same time. When this happens, mark every question that message answers as done, not just one of them. Do not ask about breed again later just because you used part of their message to answer a different question first.

If a user gives more than one option for a question instead of a single answer (for example saying "medium or low" for energy level, or "puppy or adult" for age), accept this as a valid flexible answer rather than asking them to pick just one. Remember that they are open to either option when you summarise their preferences at the end.

If a user expresses uncertainty, indecision or asks for your opinion or recommendation when answering a question, in any wording not just specific phrases. Do not repeat the same question and you must not move on to the next question yet either. Instead briefly offer 2-3 helpful suggestions related to that question to help them decide, then ask the question again in a different way.
If the user is giving up a pet, keep these follow up suggestions phrased about their own pet's actual characteristics too (for example, "does your cat lean more toward small or large build?"), never as "would you prefer," since they already have this pet.

For energy level: mention that low energy breeds suit people with a busy lifestyle or limited time for exercise. While high energy breeds suit owners who can commit to daily walks, runs or active playtime. Give 1-3 named examples of breeds matching their chosen species.

For breed: mention that if size matters, smaller breeds are easier for flats while large breds require more space. If grooming matters, short haired breeds need less maintenance than long haired ones. Give 1-3 named example breeds matching their chosen species. Do not ask about energy level, age or any other question until they have responded to this breed question specifically. 

For age: mention that puppies and kittens need more time, training and patience. While adults or senior pets are often calmer and easier for first time owners.

For indoor/outdoor: mention that cats can be strictly indoor if there's no safe outdoor access nearby, while dogs generally need some outdoor space and regular walks.

Keep suggestions brief, specific and friendly, then gently ask the question again so they can give an answer.

There are 7 questions in total for someone adopting and 10 for someone giving up a pet for adoption. Before you summarise at the end, check that you have actually asked and received an answer for every single question in the list, in order. If any question has not been answered yet, ask it before summarising. Do not move to the summary until all questions have been covered.

Reminder: before asking the first question below, re-check the user's very first message in this conversation. If they already named a species (cat or dog) or a breed there, skip those specific questions and start from the next one they haven't answered.

If adopting, ask one question at a time in this order:

1. Are you looking for a cat or a dog?
2. What breed are you interested in?
3. What energy level suits your life style? (low, medium, high)
4. What age are you looking for? (kitten/puppy, teenager, adult, senior)
5. Would you prefer an indoor or outdoor pet?
6. Do you have children at home?
7. Do you have any other pets at home


Reminder: before asking the first question below, re-check the user's very first message in this conversation. If they already named a species (cat or dog) or a breed there, skip those specific questions and start from the next one they haven't answered.

If putting up for adoption, ask one at a time in this order:

1. What's the pet's name?
When you first ask this question, just ask it normally with no extra phrase attached. Only after the user has actually replied, if their reply indicates the pet doesn't have a name (for example, saying it's a rescue, unnamed, they haven't decided or anything similar) then include the exact phrase "no name given" somewhere in your next reply, once before moving to the next question. Never include this phrase before the user has answered.

2.Is your pet a cat or a dog?
3. Would you like to upload a photo of your pet?
4. What breed is your pet?
5. What energy level does your pet have? (low, medium or high)
6. How old is your pet?
7. Is your pet indoor or outdoor?
8. Is your pet good with children?
9. Is your pet good with other animals?
10. Is your pet microchipped? (required by UK law)

When using the giving up question list, always phrase questions as asking about the user's own pet's actual situation and characteristics (for example, "Is your pet indoor or outdoor?", "Does your pet get on well with children?"). Never phrase these as asking what the user would prefer, want or like in a future pet, since they are describing a pet they already have, not searching for one.

IMPORTANT: Throughout the entire giving up conversation, including any follow up suggestions, clarifications or rephrased questions. Always speak as if the user already owns this pet and is describing it. never use phrases like "would you prefer," "are you looking for," "what would suit you," or anything implying they are searching for a pet. Always phrase things like "does your pet...", "is your pet...", "how would you describe your pet's...".

For the adopting path, once all 7 questions have been answered, give a short summary and say: "Thank you for sharing all of that! I've got everything I need. I'll start matching you with pets now."

For the giving up path, once all 11 questions have been answered, give a short summary and say: "Thanks for sharing all of that! I've got everything I need. I'll create your pet profile for review now". 

Never mention finding matches during the giving up path. 

Vary how you word each question and reply. Don't reuse the exact same sentence twice in conversation. Say things in a slightly different way each time, even if the meaning stays the same.

Give warm, detailed, conversational replies of 3-5 sentences, so Adam sounds natural and personable rather than robotic. Only discuss cats and dogs. If they go off topic, bring them back to pet adoption.


"""


# Main chat endpoint that controls the conversation flow, identifies the user's intent and connects Adam with matching and surrender features.
@app.post("/chat")
def chat(data: Message):
    last_matches = load_last_matches()
    mentioned_pet = find_mentioned_pet(data.message, last_matches)
    if mentioned_pet:
        answer = answer_pet_question(mentioned_pet, data.message)
        if answer:
            reply = f"{answer}"
        else:
            log_unanswered_question(mentioned_pet["name"], data.message)
            reply = f"That's a great question about {mentioned_pet['name']}! I don't have that information right now, but I've passed it along to the shelter so they can get back to you."
        return {
            "reply": reply,
            "species": "",
            "matched_pets": []
        }
    
    user_messages = [msg for msg in data.conversation if msg["role"] == "user"]
    first_message = user_messages[0]["content"] if user_messages else data.message
    prefs = extract_preferences(first_message)
    species = prefs["species"] or detect_species(data.message)


    path = classify_intent(first_message)
    print("PATH IS:", path, "| first_message was:", first_message)

    if path == "give_up":
        surrender_progress = extract_surrender_details(
            data.conversation, 
            data.message
        )
        next_question = get_next_give_up_question(surrender_progress)

        if next_question:
            all_messages = data.conversation + [{"role": "user", "content": data.message}]
            prev_question = ""
            if len(all_messages) >= 2 and all_messages[-2]["role"] == "assistant":
                prev_question = all_messages[-2]["content"]

            acknowledgement = generate_acknowledgement(
                data.message,
                prev_question,
                gender=surrender_progress.get("gender")
            )
            final_reply = f"{acknowledgement} {next_question}".strip()
            return {
                "reply": final_reply,
                "species": species,
                "matched_pets": []
            }
        else:
            new_pet = save_surrendered_pet(surrender_progress, photo_url=surrender_progress.get("photo_url"))
            final_reply = (
                f"Thanks for sharing all of that! I've created a profile for "
                f"{new_pet['name']}. It'll be reviewed before going live for adopters. If you need to update or correct anything, please get in touch with FurryMatcher."
    
            )
            return {
                "reply": final_reply, 
                "species": species, 
                "matched_pets": [new_pet]
            }
    
    message_lower = data.message.lower()
    breed_mentioned = any(breed in message_lower for breed in DOG_BREEDS + CAT_BREEDS)
    indoor_outdoor_mentioned = any(word in message_lower for word in ["indoor", "outdoor", "outside", "inside", "garden", "flat", "apartment", "house"])
    extra_context = ""

    if path == "adopt":
            if species == "dog" and prefs["breed"]:
                extra_context += f" The user wants a dog and their preferred breed is {prefs['breed']}. Do not ask about species or breed."
            elif species == "dog":
                extra_context += " The user wants a dog. Do not ask about species. Ask about breed next."
            elif species == "cat" and prefs["breed"]:
                extra_context += f"The user wants a cat and their preferred breed is {prefs['breed']}. Do not ask about species or breed."    
            elif species == "cat":
                extra_context += " The user wants a cat. Do not ask about species. Ask about breed next."

            if prefs["energy"]:
                extra_context += f" The user's preferred energy level is {prefs['energy']}. Do not ask about energy level."
            if prefs["age"]:
                extra_context += f" The user's preferred age is {prefs['age']}. Do not ask about age."
            if prefs["indoor_outdoor"]:
                extra_context += f" The user prefers a {prefs['indoor_outdoor']} pet. Do not ask about indoor or outdoor."          
            else:
                extra_context += " You must ask the user whether they prefer an indoor or outdoor pet. Do not skip this question."
            if prefs["children"] is True:
                extra_context += " The user has children at home. Do not ask about children."
            elif prefs["children"] is False:
                extra_context += " The user does not have children at home. Do not ask about children."
            if prefs["other_pets"] is True:
                extra_context += " The user has other pets at home. Do not ask about other pets"
            elif prefs["other_pets"] is False:
                extra_context += " The user does not have other pets at home. Do not ask about other pets."


            path_instruction = "The user is adopting a pet. You must ONLY use the adopting question list. NEVER ask about uploading a photo, micropchipping or any question from the giving up list."
                  
            system_content = SYSTEM_PROMPT  + "\n\n" + path_instruction
            if extra_context:
                system_content += "\n\n" + extra_context
        
            messages = [{"role": "system", "content": system_content}]
            for msg in data.conversation:
                messages.append(msg)
            messages.append({"role": "user", "content": data.message})
            response = requests.post (
            "http://localhost:11434/api/chat",
            json={
                "model": "gemma3",
                "messages": messages,
                "stream": False,
                "options": {
                    "temperature": 1.8,
                    "repeat_penalty": 1.5,
                    "top_p": 0.95,
                    "top_k": 100
                }
            }
        )
    reply = response.json()["message"]["content"]

    matched_pets = []
    if path == "adopt" and ("matching you" in reply.lower() or "start matching" in reply.lower()):
        all_prefs = extract_all_preferences(data.conversation, data.message)
        matches, unavailable = match_pets(
            all_prefs["species"], all_prefs["breed"], all_prefs["energy"],
            all_prefs["age"], all_prefs["indoor_outdoor"],
            all_prefs["children"], all_prefs["other_pets"]
        )
        if matches:
            names = ", ".join(pet["name"] for pet in matches)

            if matches[0].get("is_alternative"):
                if unavailable and unavailable["type"] == "breed":
                    reply += f" We don't currently have any {unavailable['value']}s, but here are some close alternatives you might like: {names}!"
                elif unavailable and unavailable["type"] == "age":
                    reply += f" We don't currently have that age available, but here are some close alternatives you might like: {names}!"
                else:
                    reply += f" I couldn't find an exact match for everything you're after, but here are some close alternatives you might like: {names}!"
            else:
                reply += f" Here are some great matches: {names}!"
            reply += " Do you have any questions about any of these pets?"
            matched_pets = matches
            saved_matches(matched_pets)
        else:
            reply += " I couldn't find any pets matching that right now, but check back soon as new pets are added!"
                
    elif path == "give_up":
            surrender_details = extract_surrender_details(
                data.conversation,
                data.message
            )

            has_name = surrender_details["name"] is not None
            has_species = surrender_details["species"] is not None
            has_breed = surrender_details["breed"] is not None
            has_energy = surrender_details["energy"] is not None
            has_age = surrender_details["age"] is not None
            has_indoor_outdoor = surrender_details["indoor_outdoor"] is not None
            has_children = surrender_details["children_ok"] is not None
            has_other_pets = surrender_details["other_pets_ok"] is not None
            has_microchip = surrender_details["microchipped"] is not None

            if (
                has_name
                and has_species
                and has_breed
                and has_energy
                and has_age
                and has_indoor_outdoor
                and has_children
                and has_other_pets
                and has_microchip
            ):

                new_pet = save_surrendered_pet(surrender_details)
                reply += f" Here's the profile I've put together for {new_pet['name']}. It'll be reviewed before going live for adopters. If you need to update or correct anything, please get in touch with FurryMatcher"
                matched_pets = [new_pet]

    return {
        "reply": reply, 
        "species": species, 
        "matched_pets": matched_pets
    }


# Processes an uploaded pet photo and uses the trained model to predict the breed and confidence score.
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    img = Image.open(io.BytesIO(contents))
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGB")
    img = img.resize((180,180))

    img_array = np.array(img, dtype=np.float32)
    img_array = np.expand_dims(img_array, 0)
    img_array = (img_array / 127.5) - 1.0
    
    model = keras.models.load_model(
        "/Users/libinhassan/FurryMatcher-backend/breed_model_v2.keras",
        safe_mode=False
    )
    class_names = sorted(os.listdir("/Users/libinhassan/FurryMatcher-backend/dataset_v2"))
    
    predictions = model(img_array, training=False).numpy()[0]
    predicted_breed = class_names[int(np.argmax(predictions))]
    confidence = float(round(100 * np.max(predictions), 2))

    return {"breed": predicted_breed, "confidence": confidence}

# Saves an uploaded pet photo and returns its URL for the pet profile.
@app.post("/upload_photo")
async def upload_photo(file: UploadFile = File(...)):
    upload_dir = "/Users/libinhassan/FurryMatcher-backend/uploaded_photos"
    os.makedirs(upload_dir, exist_ok=True)

    filename = f"{int(time.time())}_{file.filename}"
    filepath = os.path.join(upload_dir, filename)
    contents = await file.read()
    with open(filepath, "wb") as f:
        f.write(contents)

    photo_url = f"http://127.0.0.1:8000/photos/{filename}"
    return {"photo_url": photo_url}


# Returns the user's previously saved matches.
@app.get("/matches")
def get_matches():
    matches_file = "/Users/libinhassan/FurryMatcher-backend/matches.json"
    try:
        with open(matches_file, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

# Clears the user's previously saved pet matches.
@app.post("/clear_matches")
def clear_matches_endpoint():
    clear_matches()
    return {"status": "cleared"}

# Returns all available pets for the Browse page.
@app.get("/browse")
def get_all_pets():
    return load_pets()

