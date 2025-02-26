import json

def update_ids(filename):
    with open(filename, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    if isinstance(data, list):  # Ensure it's a list of objects
        for index, obj in enumerate(data, start=1):
            obj["id"] = index
    
    with open(filename, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4, ensure_ascii=False)

# Usage
update_ids("questions_moyenne.json")