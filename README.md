# 📦 CSV to JSON Converter API

This project is a  **JavaScript + Node.js + Express** application that converts CSV files into structured **JSON format**.  
It’s designed to read CSV files (from a local folder) and expose the converted data via a **REST API** endpoint that you can access both from your browser and Postman.

---

## 🚀 Features

- 📂 Reads CSV files stored in the `csv_files` folder  
- 🔄 Converts CSV data into properly nested **JSON** objects  
- 🌐 Accessible through both:
  - `GET /convert` → View JSON in your browser  
  - `POST /convert` → Fetch JSON via API clients (like Postman or curl)  
- ⚙️ Configurable via `.env` file  
- 🧱 Simple and clean code structure using modern JavaScript  

---

## 🛠️ Technologies Used

- **Node.js** (Runtime)
- **Express.js** (Server Framework)
- **csv-parser** (CSV to JSON conversion)
- **dotenv** (Environment variable management)

---

## 📁 Project Structure

csv-to-json-api/
├── csv_files/ # Folder containing your CSV files
│ └── users.csv # Example CSV file
├── index.js # Main server file
├── .env # Environment configuration
├── .gitignore # Ignored files for Git
├── package.json # Dependencies and scripts
└── README.md # Project documentation



CSV:
name.firstName,name.lastName,age,address.line1,address.line2,address.city,address.state,gender
Rohit,Prasad,35,A-563 Rakshak Society,New Pune Road,Pune,Maharashtra,male
Sneha,Joshi,22,B-102 Green Park,MG Road,Mumbai,Maharashtra,female

JSON:
{
  "message": "✅ CSV successfully converted to JSON",
  "totalRecords": 2,
  "data": [
    {
      "name": {
        "firstName": "Rohit",
        "lastName": "Prasad"
      },
      "age": "35",
      "address": {
        "line1": "A-563 Rakshak Society",
        "line2": "New Pune Road",
        "city": "Pune",
        "state": "Maharashtra"
      },
      "gender": "male"
    },
    {
      "name": {
        "firstName": "Sneha",
        "lastName": "Joshi"
      },
      "age": "22",
      "address": {
        "line1": "B-102 Green Park",
        "line2": "MG Road",
        "city": "Mumbai",
        "state": "Maharashtra"
      },
      "gender": "female"
    }
  ]
}
