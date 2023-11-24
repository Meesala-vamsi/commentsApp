const express = require('express');
const path = require('path')
const {open}=require('sqlite')
const sqlite3 = require('sqlite3')
const dbPath = path.join(__dirname,'goodreads.db')
const app = express();
app.use(express.json())

let db=null;

const initializeDB = async ()=>{
    try{
        db=await open({
        filename:dbPath,
        driver:sqlite3.Database
    });
    app.listen(4000,()=>{
        console.log(`The Server is running at http://localhost:4000`)
    });
}catch(e){
    console.log(e.message)
    process.exit(1)
}
}

app.get('/books/:id',async(request,response)=>{
    const {params} = request;
    const {id} = params;
    const getDetailsQuery=`
        SELECT * FROM book WHERE book_id=${id};
    `
    const details = await db.get(getDetailsQuery);
    response.send(details)
})

app.post('/books/',async(request,response)=>{
    const bookDetails=request.body
    const {title,authorId,rating,ratingCount,reviewCount,description,pages,dateOfPublication,editionLanguage,price,onlineStores} = bookDetails
    const addBooksQuery=`
        INSERT INTO book (
            title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
            VALUES(
                '${title}',
                ${authorId},
                ${rating},
                ${ratingCount},
                ${reviewCount},
                '${description}',
                ${pages},
                '${dateOfPublication}',
                '${editionLanguage}',
                '${price}',
                '${onlineStores}'
            )
          
            
    `
    const getDetails=await db.run(addBooksQuery)
    const bookId = getDetails.lastID
    response.send({bookId:bookId})
    
})

app.get('/',async(request,response)=>{
    const getDetailsQuery = `SELECT * FROM book`

    const responseData = await db.all(getDetailsQuery)
    response.send(responseData)
})

initializeDB();

