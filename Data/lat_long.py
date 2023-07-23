import requests
import csv

def get_lat_lng(address):
    base_url = 'https://maps.googleapis.com/maps/api/geocode/json'
    api_key = 'AIzaSyBGi6Ab3OJgEzZi_WuJ7TXhlkdiiKxN00E' 
    params = {'address': address, 'key': api_key}
    response = requests.get(base_url, params=params)
    resp_json_payload = response.json()

    if resp_json_payload['status'] == 'OK':
        location = resp_json_payload['results'][0]['geometry']['location']
        return location['lat'], location['lng']
    else:
        print(f"No lat. long. found. Error!! Address looked up: {address}")
        return None, None

with open('data.csv', 'r') as csv_file:
    reader = csv.reader(csv_file)
    data = list(reader)

for i, row in enumerate(data):
    address = row[1]  
    lat, lng = get_lat_lng(address)
    row.append(lat)
    row.append(lng)

    column_1_value = row[0].replace(" ", "").strip()
    filename = f"logos/{column_1_value}.png"
    row.append(filename)

    print(f"{i+1} Processing:{row[0]}, {lat}, {lng}")

with open('data.csv', 'w', newline='') as csv_file:
    writer = csv.writer(csv_file)
    writer.writerows(data)

