import sqlite3
import math

def haversine(coord1, coord2):
    # Convert latitude and longitude from degrees to radians
    lon1, lat1, lon2, lat2 = map(math.radians, [coord1[0], coord1[1], coord2[0], coord2[1]])

    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = 6371 * c  # Earth's radius in kilometers (use 3959 for miles)

    return distance

def find_closest_coordinate(user_longitude, user_latitude):
    conn = sqlite3.connect("hack.db")
    cursor = conn.cursor()

    cursor.execute("SELECT name, longitude, latitude FROM hack1_coords")
    coordinates = cursor.fetchall()

    my_coordinate = (user_longitude, user_latitude)
    closest_coordinate = min(coordinates, key=lambda coord: haversine(my_coordinate, (coord[1], coord[2])))
    closest_name, closest_longitude, closest_latitude = closest_coordinate
    distance = haversine(my_coordinate, (closest_longitude, closest_latitude))
    cursor.execute("SELECT name, type, question, answer FROM hack1_questions WHERE name=?", (closest_name,))
    question_data = cursor.fetchone()

    conn.close()
    return question_data, distance

def main():
    try:
        user_input = input("Enter your latitude and longitude (in the form 'latitude, longitude'): ")
        user_latitude, user_longitude = map(float, user_input.split(","))
    except ValueError:
        print("Invalid input. Latitude and longitude must be numeric values.")
        return

    question_data, distance = find_closest_coordinate(user_longitude, user_latitude)

    name, question_type, question, answer = question_data
    user_answer = input(f"{question} (Name: {name}, Type: {question_type})\nAnswer: ")

    if user_answer.lower() == answer.lower():
        print("Correct")
    else:
        print("Incorrect")
    print(f"Distance to closest location ({name}): {distance:.2f} kilometers")

if __name__ == "__main__":
    main()
