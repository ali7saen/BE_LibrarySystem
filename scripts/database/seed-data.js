const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});


async function insertCages(filePath, subject) {
    const fileData = fs.readFileSync(filePath);

    const books = JSON.parse(fileData)

    const cages = []
    const cagesObjects = []


    // add cages to array 
    let i = 0;
    for (const book of books) {
        if (!cages.includes(book.cage_name)) {
            i = i + 1;
            cages.push(book.cage_name)
            cagesObjects.push({
                cage_categories: subject,
                cage_code: `${subject}_${i}`,
                cage_name: book.cage_name
            })
        }
    }

    const db = await pool.connect();

    try {
        console.log('Starting insert data...');

        for (const cageObject of cagesObjects) {
            await db.query(
                "INSERT INTO cages (cage_code, cage_categories, cage_name) VALUES ($1, $2, $3);",
                [
                    cageObject.cage_code,
                    cageObject.cage_categories,
                    cageObject.cage_name
                ]
            )
        }
        console.log('Data was inserted successfully');

    } catch (error) {
        console.error('Insert data failed:', error.message);
    } finally {
        db.release();
        await pool.end();
    }
}


async function insertShelves(filePath) {

    const db = await pool.connect();

    const result = await db.query("SELECT * FROM cages WHERE is_active = $1", [true])

    const cages = result.rows;

    const books = JSON.parse(fs.readFileSync(filePath))

    const shelvesObjects = []
    const shelves = []
    for (const cage of cages) {
        for (const book of books) {
            if (cage.cage_name == book.cage_name) {
                const shelve_number_with_cage_name = `${book.cage_name} _ ${book.shelve_number}`
                if (!shelves.includes(shelve_number_with_cage_name)) {
                    shelves.push(shelve_number_with_cage_name)
                    shelvesObjects.push({
                        shelve_number: book.shelve_number,
                        cage_id: cage.cage_id
                    })
                }
            }
        }
    }


    try {
        console.log('Starting insert data...');

        for (const shelve of shelvesObjects) {
            await db.query(
                "INSERT INTO shelves (shelve_number, cage_id) VALUES ($1, $2);",
                [
                    shelve.shelve_number,
                    shelve.cage_id
                ]
            )
        }
        console.log('Data was inserted successfully');

    } catch (error) {
        console.error('Insert data failed:', error.message);
    } finally {
        db.release();
        await pool.end();
    }

}


async function insertBooks(filePath, book_category) {

    const db = await pool.connect();

    const shelvesQuery = `
    SELECT SH.*, C.cage_name FROM shelves SH
        INNER JOIN cages C
            ON SH.cage_id = C.cage_id
    `

    const shelves = (await db.query(shelvesQuery)).rows;

    const booksObjects = []
    const books = JSON.parse(fs.readFileSync(filePath))
    for (const book of books) {
        for (const shelve of shelves) {
            if (book.shelve_number == shelve.shelve_number && book.cage_name == shelve.cage_name) {
                booksObjects.push({
                    book_title: book.book_title,
                    book_sequence: book.book_sequence,
                    book_author: "محمد علي حسين",
                    cage_id: shelve.cage_id,
                    shelve_id: shelve.shelve_id
                })
            }
        }
    }

    for (const bookObject of booksObjects) {
        await db.query(
            "INSERT INTO books (book_title, book_sequence, cage_id, shelve_id, book_category, book_author) VALUES ($1, $2, $3, $4, $5, $6);",
            [
                bookObject.book_title,
                bookObject.book_sequence,
                bookObject.cage_id,
                bookObject.shelve_id,
                book_category,
                bookObject.book_author
            ]
        )
    }

    process.exit()
}















// insertCages(path.join(__dirname, "../data/الحديث.json"), JSON.stringify(["الحديث"]))
// insertShelves(path.join(__dirname, "../data/الحديث.json"))
// insertBooks(path.join(__dirname, "../data/الحديث.json"), "الحديث")