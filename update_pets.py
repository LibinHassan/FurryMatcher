import json

PETS_FILE = "/Users/libinhassan/FurryMatcher-backend/pets.json"

with open(PETS_FILE, "r") as f:
    pets = json.load(f)

fixed_count = 0
already_ok_count = 0

for pet in pets:
    if "barks_a_lot" in pet:
        already_ok_count += 1
        continue


    name = pet.get("name", "This pet")
    species = pet.get("species", "pet")
    age = pet.get("age", "adult")
    energy = pet.get("energy", "medium")
    is_young = age in ("kitten/puppy", "kitten", "puppy")
    is_cat = species == "cat"

    if is_cat:
         pet["barks_a_lot"] = f"N/A, {name} is a cat."
    elif energy == "high":
        pet["barks_a_lot"] = "Can be vocal when excited or during play."
    else:
        pet["barks_a_lot"] = "Rarely barks, generally a quiet dog."

    pet["ok_alone"] = (
        "Prefers not to be left alone for long periods due to their energy levels."
        if energy == "high" else
        "Comfortable being left alone for a few hours at a time."    
    )
    pet["car_behaviour"] = "Travels reasonable well, settling calmly for short journeys." 
    pet["time_waiting"] = f"{name} has been waiting for a home for a few weeks."
    pet["surrender_reason"] = (
        f"N/A, {name} was born in a foster care."
        if is_young else
        "Their previous owner could no longer provide the care they needed."
    )
    pet["meet_before_adopting"] = "Yes, meet and greets can be arranged before adopting."
    pet["adoption_fee"] = (
        "£90, which covers vaccinations and a health check."
        if is_cat else
        "£150, which covers vaccinations and a health check."    
    )   
    pet["included_belongings"] = (
        f"{name} will come with their bed and a few toys to help them settle in."
        if is_cat else
        f"{name} will come with their bed, lead a few toys to help them settle in."
    )

    fixed_count += 1


with open(PETS_FILE, "w") as f:
    json.dump(pets, f, indent=4)

print(f"Fixed {fixed_count} pets that were missing fields, {already_ok_count} already had everything.")